import { DurableObjectStubProxy } from 'do-proxy'

import { BadRequestError } from '@proofzero/errors'
import { EmailAddressType, NodeType } from '@proofzero/types/address'
import generateRandomString from '@proofzero/utils/generateRandomString'

import { EMAIL_VERIFICATION_OPTIONS } from '../constants'
import { AddressProfile } from '../types'

import { AddressNode } from '.'
import Address from './address'

type EmailAddressProfile = AddressProfile<EmailAddressType.Email>

type VerificationPayload = {
  state: string
  creationTimestamp: number
  numberOfAttempts: number
  firstAttemptTimestamp: number
  code: string
  cooldownStartTimestamp?: number
}

const OTP_KEY_NAME = 'otp'

export default class EmailAddress {
  declare node: AddressNode

  constructor(node: AddressNode) {
    this.node = node
  }

  private createCode = async ({
    state,
    creationTimestamp,
    numberOfAttempts,
    firstAttemptTimestamp,
    code,
  }: VerificationPayload) => {
    if (
      firstAttemptTimestamp +
        EMAIL_VERIFICATION_OPTIONS.maxAttemptsTimePeriodInMs <=
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
    }

    await this.node.storage.put(OTP_KEY_NAME, payload)
  }

  async generateVerificationCode(state: string): Promise<string> {
    const verificationPayload =
      await this.node.storage.get<VerificationPayload>(OTP_KEY_NAME)

    const currentTime = Date.now()
    const code = generateRandomString(
      EMAIL_VERIFICATION_OPTIONS.codeLength
    ).toUpperCase()

    if (verificationPayload) {
      // After limit for 5 attempts is hit, we set a cool down 10 minutes from the last attempt
      if (
        verificationPayload.numberOfAttempts + 1 >
          EMAIL_VERIFICATION_OPTIONS.maxAttempts &&
        verificationPayload.creationTimestamp +
          EMAIL_VERIFICATION_OPTIONS.regenCooldownPeriodInMs >
          currentTime
      ) {
        const timeLeft =
          verificationPayload.creationTimestamp +
          EMAIL_VERIFICATION_OPTIONS.regenCooldownPeriodInMs -
          currentTime

        throw new BadRequestError({
          message: `Cannot generate new code for the address. You can only generate  ${
            EMAIL_VERIFICATION_OPTIONS.maxAttempts
          } new codes within ${
            EMAIL_VERIFICATION_OPTIONS.maxAttemptsTimePeriodInMs / 1000 / 60
          }
          minutes. Try again in ${Math.ceil(timeLeft / 1000 / 60)} minutes`,
        })
      }

      // Subsequent calls to generate a new code are limited to one per 30 seconds
      if (
        verificationPayload.creationTimestamp +
          EMAIL_VERIFICATION_OPTIONS.delayBetweenRegenAttemptsInMs >
        currentTime
      ) {
        throw new BadRequestError({
          message: `Cannot generate new code for the address. You can only generate a new code once every ${
            EMAIL_VERIFICATION_OPTIONS.delayBetweenRegenAttemptsInMs / 1000
          } seconds`,
        })
      }

      // we limit the number of attempts to 5 within 5 minutes
      // once the limit of 5 attempts is hit, we set a cool down 10 minutes from the last attempt
      // and we set new alarm
      if (
        verificationPayload.numberOfAttempts + 1 ===
          EMAIL_VERIFICATION_OPTIONS.maxAttempts &&
        verificationPayload.firstAttemptTimestamp +
          EMAIL_VERIFICATION_OPTIONS.maxAttemptsTimePeriodInMs >
          currentTime
      ) {
        await this.node.storage.setAlarm(
          currentTime + EMAIL_VERIFICATION_OPTIONS.regenCooldownPeriodInMs
        )
      } else {
        // we set alarm here. it'll be reset in the next condition if its triggered
        await this.node.storage.setAlarm(
          currentTime + EMAIL_VERIFICATION_OPTIONS.ttlInMs
        )
      }

      // we increment the number of attempts independently of any conditions
      await this.createCode({
        state,
        creationTimestamp: currentTime,
        numberOfAttempts: verificationPayload.numberOfAttempts + 1,
        firstAttemptTimestamp: verificationPayload.firstAttemptTimestamp,
        code,
      })

      return code
    }
    await this.node.storage.setAlarm(
      currentTime + EMAIL_VERIFICATION_OPTIONS.ttlInMs
    )

    await this.node.class.setNodeType(NodeType.Email)
    await this.node.class.setType(EmailAddressType.Email)

    await this.createCode({
      state,
      creationTimestamp: currentTime,
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
      emailVerification.creationTimestamp +
        EMAIL_VERIFICATION_OPTIONS.ttlInMs <=
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

  static async alarm(address: Address) {
    // If account exists we don't delete the whole node
    const account = await address.getAccount()

    if (account) {
      await address.state.storage.delete(OTP_KEY_NAME)
    }
    // if not we delete the whole node
    else {
      await address.state.storage.deleteAll()
    }
  }

  async getProfile(): Promise<EmailAddressProfile> {
    const [nickname, gradient, address] = await Promise.all([
      this.node.class.getNickname(),
      this.node.class.getGradient(),
      this.node.class.getAddress(),
    ])
    if (!address) throw new Error('Cannot load profile for email address node')
    return {
      address,
      title: nickname ?? address,
      icon: gradient,
      type: EmailAddressType.Email,
    }
  }
}
export type EmailAddressProxyStub = DurableObjectStubProxy<EmailAddress>
