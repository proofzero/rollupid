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
  delayStartTimestamp?: number
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

    if (verificationPayload) {
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
      // Once the limit of 5 attempts is hit, we count 10 minutes from the last attempt
      if (
        verificationPayload.delayStartTimestamp &&
        verificationPayload.delayStartTimestamp +
          EMAIL_VERIFICATION_OPTIONS.regenDelayForMaxAttepmtsInMs >
          Date.now()
      ) {
        const timeLeft =
          verificationPayload.delayStartTimestamp +
          EMAIL_VERIFICATION_OPTIONS.regenDelayForMaxAttepmtsInMs -
          Date.now()

        throw new BadRequestError({
          message: `Cannot generate new code for the address. You will be able to try after ${Math.floor(
            timeLeft / 1000 / 60
          )} minutes ${
            Math.floor((timeLeft / 1000) % 60)
              ? `and ${Math.floor((timeLeft / 1000) % 60)}  seconds`
              : ''
          }`,
        })
      }

      // We count 5 minutes from the first attempt
      if (
        verificationPayload.numberOfAttempts >
          EMAIL_VERIFICATION_OPTIONS.maxAttempts &&
        verificationPayload.firstAttemptTimestamp +
          EMAIL_VERIFICATION_OPTIONS.maxAttempsTimePeriod >
          Date.now()
      ) {
        const delayStartTimestamp = Date.now()
        verificationPayload.delayStartTimestamp = delayStartTimestamp
        await this.node.storage.put(OTP_KEY_NAME, verificationPayload)
        await this.node.storage.setAlarm(
          delayStartTimestamp +
            EMAIL_VERIFICATION_OPTIONS.regenDelayForMaxAttepmtsInMs
        )
        throw new BadRequestError({
          message: `Cannot generate new code for the address.
            You can only generate  ${
              EMAIL_VERIFICATION_OPTIONS.maxAttempts
            } new codes within ${
            EMAIL_VERIFICATION_OPTIONS.maxAttempsTimePeriod / 1000 / 60
          }
            minutes. Please try again in ${
              EMAIL_VERIFICATION_OPTIONS.regenDelayForMaxAttepmtsInMs /
              1000 /
              60
            } minutes.`,
        })
      }
    }

    const creationTimestamp = Date.now()
    let numberOfAttempts = 1,
      firstAttemptTimestamp = creationTimestamp
    if (verificationPayload) {
      numberOfAttempts = verificationPayload.numberOfAttempts + 1
      firstAttemptTimestamp = verificationPayload.firstAttemptTimestamp
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
    }

    this.node.class.setNodeType(NodeType.Email)
    this.node.class.setType(EmailAddressType.Email)
    await this.node.storage.put(OTP_KEY_NAME, payload)
    await this.node.storage.setAlarm(
      creationTimestamp + EMAIL_VERIFICATION_OPTIONS.ttlInMs
    )

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
      await address.state.storage.get<VerificationPayload>(OTP_KEY_NAME)

    if (
      // we only have delayStartTimestamp if the limit of 5 attempts was hit
      // this is how we check if the limit was hit and delete node
      verificationPayload?.delayStartTimestamp &&
      verificationPayload.delayStartTimestamp +
        EMAIL_VERIFICATION_OPTIONS.regenDelayForMaxAttepmtsInMs <=
        Date.now()
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
    }
    // if the limit was not hit we follow this path
    if (
      verificationPayload &&
      verificationPayload.creationTimestamp +
        EMAIL_VERIFICATION_OPTIONS.ttlInMs <=
        Date.now()
    ) {
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
