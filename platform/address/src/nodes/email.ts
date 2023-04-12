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
  delayStartTimestamp?: number
}

const CODES_KEY_NAME = 'codes'

export default class EmailAddress {
  declare node: AddressNode

  constructor(node: AddressNode) {
    this.node = node
  }

  async generateVerificationCode(state: string): Promise<string> {
    const verificationCodes =
      (await this.node.storage.get<Record<string, VerificationPayload>>(
        CODES_KEY_NAME
      )) || {}

    let numberOfAttempts
    let firstAttemptTimestamp

    for (const [code, payload] of Object.entries(verificationCodes)) {
      if (
        payload.creationTimestamp +
          EMAIL_VERIFICATION_OPTIONS.regenDelaySubsCallInMs >
        Date.now()
      ) {
        throw new BadRequestError({
          message: `Cannot generate new code for the address. You can only generate a new code once every ${
            EMAIL_VERIFICATION_OPTIONS.regenDelaySubsCallInMs / 1000
          } seconds`,
        })
      }
      numberOfAttempts = payload.numberOfAttempts
      firstAttemptTimestamp = payload.firstAttemptTimestamp

      // We count 5 minutes from the first attempt
      if (
        numberOfAttempts >= EMAIL_VERIFICATION_OPTIONS.maxAttempts &&
        payload.firstAttemptTimestamp +
          EMAIL_VERIFICATION_OPTIONS.maxAttempsTimePeriod >
          Date.now()
      ) {
        payload.delayStartTimestamp = Date.now()
        throw new BadRequestError({
          message: `Cannot generate new code for the address.
          You can only generate  ${
            EMAIL_VERIFICATION_OPTIONS.maxAttempts
          } new codes within ${
            EMAIL_VERIFICATION_OPTIONS.maxAttempsTimePeriod / 1000 / 60
          }
          minutes. Please try again in ${
            EMAIL_VERIFICATION_OPTIONS.regenDelayForMaxAttepmtsInMs / 1000 / 60
          } minutes.}`,
        })
      }

      // Once the limit of 5 attempts is hit, we count 10 minutes from the last attempt
      if (
        payload.delayStartTimestamp &&
        payload.delayStartTimestamp +
          EMAIL_VERIFICATION_OPTIONS.regenDelayForMaxAttepmtsInMs >
          Date.now()
      ) {
        const timeLeft =
          payload.delayStartTimestamp +
          EMAIL_VERIFICATION_OPTIONS.regenDelayForMaxAttepmtsInMs -
          Date.now()

        throw new BadRequestError({
          message: `Cannot generate new code for the address. You can only generate a new code after ${Math.floor(
            timeLeft / 1000 / 60
          )} minutes and ${(timeLeft / 1000) % 60} seconds`,
        })
      }

      // Every 5 minutes we wipe the code if the limit of 5 attempt wasn't hit
      if (
        numberOfAttempts < EMAIL_VERIFICATION_OPTIONS.maxAttempts &&
        payload.firstAttemptTimestamp +
          EMAIL_VERIFICATION_OPTIONS.maxAttempsTimePeriod <
          Date.now()
      ) {
        delete verificationCodes[code]
      }
    }

    const creationTimestamp = Date.now()
    const code = generateRandomString(
      EMAIL_VERIFICATION_OPTIONS.codeLength
    ).toUpperCase()
    verificationCodes[code] = {
      state,
      creationTimestamp,
      // RE: Every 10 minutes we wipe the number of attempts and first attempt timestamp
      numberOfAttempts: numberOfAttempts ? numberOfAttempts + 1 : 1,
      firstAttemptTimestamp: firstAttemptTimestamp
        ? firstAttemptTimestamp
        : creationTimestamp,
    }

    this.node.class.setNodeType(NodeType.Email)
    this.node.class.setType(EmailAddressType.Email)
    await this.node.storage.put(CODES_KEY_NAME, verificationCodes)
    await this.node.storage.setAlarm(
      creationTimestamp + EMAIL_VERIFICATION_OPTIONS.ttlInMs
    )

    return code
  }

  async verifyCode(code: string, state: string): Promise<boolean> {
    const codes =
      (await this.node.storage.get<Record<string, VerificationPayload>>(
        CODES_KEY_NAME
      )) || {}

    const emailVerification = codes ? codes[code] : undefined
    if (!codes || !emailVerification || state !== emailVerification.state) {
      console.log('OTP verification code and state did not match')
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

    delete codes[code]

    await this.node.storage.put(CODES_KEY_NAME, codes)

    return true
  }

  static async alarm(address: Address) {
    const codes =
      (await address.state.storage.get<Record<string, VerificationPayload>>(
        CODES_KEY_NAME
      )) || {}

    for (const [code, verification] of Object.entries(codes)) {
      if (
        verification.creationTimestamp + EMAIL_VERIFICATION_OPTIONS.ttlInMs <=
        Date.now()
      ) {
        delete codes[code]
      }
    }

    await address.state.storage.put(CODES_KEY_NAME, codes)
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
