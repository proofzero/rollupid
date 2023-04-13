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

  async generateVerificationCode(state: string): Promise<string> {
    const verificationPayload =
      await this.node.storage.get<VerificationPayload>(OTP_KEY_NAME)

    const creationTimestamp = Date.now()
    let numberOfAttempts = 0,
      firstAttemptTimestamp = creationTimestamp
    // This value not undefined only when the limit of 5 attempts was hit
    let cooldownStartTimestamp = undefined

    if (verificationPayload) {
      // Subsequent calls to generate a new code will be limited to once every 30 seconds
      if (
        verificationPayload.creationTimestamp +
          EMAIL_VERIFICATION_OPTIONS.regenDelaySubsCallInMs >
        Date.now()
      ) {
        throw new BadRequestError({
          message: `Cannot generate new code for the address. You can only generate a new code once every ${
            EMAIL_VERIFICATION_OPTIONS.regenDelaySubsCallInMs / 1000
          } seconds`,
        })
      }

      // cooldownStartTimestamp is set only when the limit of 5 attempts was hit
      // when this is set, we don't allow the user to generate a new code until the delay is over
      if (
        verificationPayload.cooldownStartTimestamp &&
        verificationPayload.cooldownStartTimestamp +
          EMAIL_VERIFICATION_OPTIONS.regenDelayForMaxAttemptsInMs >
          Date.now()
      ) {
        const timeLeft =
          verificationPayload.cooldownStartTimestamp +
          EMAIL_VERIFICATION_OPTIONS.regenDelayForMaxAttemptsInMs -
          Date.now()

        throw new BadRequestError({
          message: `Cannot generate new code for the address. You can only generate  ${
            EMAIL_VERIFICATION_OPTIONS.maxAttempts
          } new codes within ${
            EMAIL_VERIFICATION_OPTIONS.maxAttemptsTimePeriod / 1000 / 60
          }
          minutes. Try again in ${Math.ceil(timeLeft / 1000 / 60)} minutes`,
        })
      }

      numberOfAttempts = verificationPayload.numberOfAttempts + 1
      firstAttemptTimestamp = verificationPayload.firstAttemptTimestamp
      // we limit the number of attempts to 5 within 5 minutes
      // once the limit of 5 attempts is hit, we set a cool down 10 minutes from the last attempt
      if (
        numberOfAttempts >= EMAIL_VERIFICATION_OPTIONS.maxAttempts &&
        firstAttemptTimestamp +
          EMAIL_VERIFICATION_OPTIONS.maxAttemptsTimePeriod >
          Date.now()
      ) {
        cooldownStartTimestamp = creationTimestamp
      }
    }

    const code = generateRandomString(
      EMAIL_VERIFICATION_OPTIONS.codeLength
    ).toUpperCase()
    const payload = {
      state,
      creationTimestamp,
      numberOfAttempts,
      firstAttemptTimestamp,
      code,
      // this will be undefined if the limit of 5 attempts was not hit
      cooldownStartTimestamp,
    }

    this.node.class.setNodeType(NodeType.Email)
    this.node.class.setType(EmailAddressType.Email)
    await this.node.storage.put(OTP_KEY_NAME, payload)

    // We have 2 types of alarms to set
    // 1. If the user has hit the limit of 5 attempts, we set a cool down of 10 minutes
    if (cooldownStartTimestamp) {
      await this.node.storage.setAlarm(
        cooldownStartTimestamp +
          EMAIL_VERIFICATION_OPTIONS.regenDelayForMaxAttemptsInMs
      )
      return code
    }
    // 2. If the user has not hit the limit of 5 attempts, we set a TTL of 5 minutes
    else {
      await this.node.storage.setAlarm(
        creationTimestamp + EMAIL_VERIFICATION_OPTIONS.ttlInMs
      )
    }

    return code
  }

  async verifyCode(code: string, state: string): Promise<boolean> {
    const verificationPayload =
      await this.node.storage.get<VerificationPayload>(OTP_KEY_NAME)

    const emailVerification = verificationPayload
      ? verificationPayload
      : undefined

    if (!verificationPayload || !emailVerification) {
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
    const verificationPayload =
      (await address.state.storage.get<VerificationPayload>(OTP_KEY_NAME))!

    if (
      // we only have cooldownStartTimestamp if the limit of 5 attempts was hit
      // this is how we check if the limit was hit and delete node
      verificationPayload.cooldownStartTimestamp
    ) {
      // check if account exists
      const account = await address.getAccount()
      if (account) {
        await address.state.storage.delete(OTP_KEY_NAME)
      }
      // if not we delete the whole node
      else {
        await address.state.storage.deleteAll()
      }
    } else {
      // if the limit was not hit we follow this path
      await address.state.storage.delete(OTP_KEY_NAME)
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
