import { DurableObjectStubProxy } from 'do-proxy'
import * as randomWords from 'random-words'

import { BadRequestError, InternalServerError } from '@proofzero/errors'
import { EmailAccountType, NodeType } from '@proofzero/types/account'
import { type AccountURN } from '@proofzero/urns/account'
import generateRandomString from '@proofzero/utils/generateRandomString'
import type { Environment } from '@proofzero/platform.core'

import { AccountProfile } from '../types'

import { EMAIL_VERIFICATION_OPTIONS } from '../constants'

import { AccountNode } from '.'
import Account from './account'

type EmailAccountProfile = AccountProfile<EmailAccountType>

type VerificationPayload = {
  state: string
  creationTimestamp: number
  delayMiliseconds: number
  numberOfAttempts: number
  firstAttemptTimestamp: number
  code: string
  cooldownStartTimestamp?: number
}

const OTP_KEY_NAME = 'otp'

export default class EmailAccount {
  declare node: AccountNode
  declare env: Environment

  constructor(node: AccountNode, env: Environment) {
    this.node = node
    this.env = env
  }

  private createCode = async ({
    state,
    creationTimestamp,
    numberOfAttempts,
    firstAttemptTimestamp,
    code,
    delayMiliseconds,
  }: VerificationPayload) => {
    if (
      firstAttemptTimestamp + this.env.MAX_ATTEMPTS_TIME_PERIOD_IN_MS <=
      Date.now()
    ) {
      numberOfAttempts = 1
      firstAttemptTimestamp = creationTimestamp
    }

    const payload = {
      state,
      creationTimestamp,
      numberOfAttempts,
      firstAttemptTimestamp,
      code,
      delayMiliseconds,
    }

    await this.node.storage.put(OTP_KEY_NAME, payload)
  }

  async generateVerificationCode(
    state: string,
    delayMiliseconds?: number
  ): Promise<string> {
    if (!delayMiliseconds) {
      delayMiliseconds = this.env.DELAY_BETWEEN_REGENERATION_ATTEMPTS_IN_MS
    }

    const verificationPayload =
      await this.node.storage.get<VerificationPayload>(OTP_KEY_NAME)

    const currentTime = Date.now()

    await this.node.class.setNodeType(NodeType.Email)
    await this.node.class.setType(EmailAccountType.Email)

    const code = generateRandomString(
      EMAIL_VERIFICATION_OPTIONS.CODE_LENGTH
    ).toUpperCase()

    if (verificationPayload) {
      const {
        numberOfAttempts,
        creationTimestamp,
        firstAttemptTimestamp,
        delayMiliseconds,
      } = verificationPayload

      // Extracted common calculations and constants for better readability
      const isAboveMaxAttempts = numberOfAttempts + 1 > this.env.MAX_ATTEMPTS
      const isCooldownPeriodActive =
        creationTimestamp + this.env.REGENERATION_COOLDOWN_PERIOD_IN_MS >
        currentTime
      const isRegenDelayActive =
        creationTimestamp + delayMiliseconds > currentTime
      const isMaxAttemptsReachedWithinTimePeriod =
        firstAttemptTimestamp + this.env.MAX_ATTEMPTS_TIME_PERIOD_IN_MS >
        currentTime

      // After limit for 5 attempts is hit, we set a cool down 10 minutes from the last attempt
      if (isAboveMaxAttempts && isCooldownPeriodActive) {
        const timeLeft =
          verificationPayload.creationTimestamp +
          this.env.REGENERATION_COOLDOWN_PERIOD_IN_MS -
          currentTime

        throw new BadRequestError({
          message: `Cannot generate new code for the address. You can only generate  ${
            this.env.MAX_ATTEMPTS
          } new codes within ${
            this.env.MAX_ATTEMPTS_TIME_PERIOD_IN_MS / 1000 / 60
          }
          minutes. Try again in ${Math.ceil(timeLeft / 1000 / 60)} minutes`,
        })
      }

      // Subsequent calls to generate a new code are limited to one per 30 seconds
      if (isRegenDelayActive) {
        throw new BadRequestError({
          message: `Cannot generate new code for the address. You can only generate a new code once every ${
            delayMiliseconds / 1000
          } seconds`,
        })
      }

      // we limit the number of attempts to 5 within 5 minutes
      // once the limit of 5 attempts is hit, we set a cool down 10 minutes from the last attempt
      // and we set new alarm
      if (
        numberOfAttempts + 1 === this.env.MAX_ATTEMPTS &&
        isMaxAttemptsReachedWithinTimePeriod
      ) {
        await this.node.storage.setAlarm(
          currentTime + this.env.REGENERATION_COOLDOWN_PERIOD_IN_MS
        )
      } else {
        // If limit wasn't hit, we set this alarm
        await this.node.storage.setAlarm(currentTime + this.env.TTL_IN_MS)
      }

      // we increment the number of attempts independently of any conditions
      await this.createCode({
        state,
        creationTimestamp: currentTime,
        delayMiliseconds,
        numberOfAttempts: numberOfAttempts + 1,
        firstAttemptTimestamp: firstAttemptTimestamp,
        code,
      })

      return code
    }
    await this.node.storage.setAlarm(currentTime + this.env.TTL_IN_MS)

    await this.createCode({
      state,
      creationTimestamp: currentTime,
      delayMiliseconds,
      numberOfAttempts: 1,
      firstAttemptTimestamp: currentTime,
      code,
    })

    return code
  }

  async verifyCode(code: string, state: string): Promise<boolean> {
    const emailVerification = await this.node.storage.get<VerificationPayload>(
      OTP_KEY_NAME
    )

    if (!emailVerification) {
      console.log('Missing OTP verification code')
      return false
    }
    if (state !== emailVerification.state) {
      console.log('OTP verification state did not match')
      return false
    }
    if (code !== emailVerification.code) {
      console.log('OTP verification code did not match')
      return false
    }

    if (
      emailVerification.creationTimestamp + this.env.TTL_IN_MS <=
      Date.now()
    ) {
      //We anticipate we'll encounter this only if an address has multiple OTP codes in the
      //codes property, where the alarm to clean them up will be the latter of the codeExpiry
      //times of all of those codes. Alarms will still clean them up eventually.
      console.error('OTP code has expired')
      return false
    }

    await this.node.storage.delete(OTP_KEY_NAME)

    return true
  }

  static async alarm(account: Account) {
    // If identity exists we don't delete the whole node
    const identity = await account.getIdentity()

    if (identity) {
      await account.state.storage.delete(OTP_KEY_NAME)
    }
    // if not we delete the whole node
    else {
      await account.state.storage.deleteAll()
    }
  }

  async getProfile(): Promise<EmailAccountProfile> {
    const [nickname, gradient, address, type] = await Promise.all([
      this.node.class.getNickname(),
      this.node.class.getGradient(),
      this.node.class.getAddress(),
      this.node.class.getType(),
    ])
    if (!address)
      throw new InternalServerError({
        message: 'Cannot load profile for email account node',
        cause: 'missing account',
      })

    return {
      address,
      type: type as EmailAccountType,
      title: nickname ?? address,
      icon: gradient,
    }
  }

  getSourceAccount() {
    return this.node.storage.get<AccountURN>('source-account')
  }

  setSourceAccount(accountURN: AccountURN) {
    return this.node.storage.put<AccountURN>('source-account', accountURN)
  }

  async getMaskedAddress(clientId: string): Promise<string> {
    const key = `masked-address/${clientId}`
    const stored = await this.node.storage.get<string>(key)
    if (stored) return stored
    const bits = generateRandomString(6)
    const words = randomWords.generate(3).join('-')
    const address = `${words}-${bits}@rollup.email`
    await this.node.storage.put<string>(key, address)
    return address
  }
}

export type EmailAccountProxyStub = DurableObjectStubProxy<EmailAccount>
