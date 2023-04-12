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
    const verificationPayloads =
      await this.node.storage.list<VerificationPayload>({
        prefix: `${CODES_KEY_NAME}/`,
      })

    let numberOfAttempts = 1
    let firstAttemptTimestamp

    if (verificationPayloads) {
      for (const [code, payload] of verificationPayloads.entries()) {
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

        firstAttemptTimestamp = payload.firstAttemptTimestamp
        // because they're not sorted and we need the max (previous attempt)
        numberOfAttempts = numberOfAttempts
          ? Math.max(payload.numberOfAttempts, numberOfAttempts)
          : payload.numberOfAttempts

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
          numberOfAttempts > EMAIL_VERIFICATION_OPTIONS.maxAttempts &&
          payload.firstAttemptTimestamp +
            EMAIL_VERIFICATION_OPTIONS.maxAttempsTimePeriod >
            Date.now()
        ) {
          const delayStartTimestamp = Date.now()
          payload.delayStartTimestamp = delayStartTimestamp
          await this.node.storage.put(`${code}`, payload)
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
            EMAIL_VERIFICATION_OPTIONS.regenDelayForMaxAttepmtsInMs / 1000 / 60
          } minutes.`,
          })
        }

        // Every 5 minutes we wipe the code if the limit of 5 attempt wasn't hit
        if (
          numberOfAttempts <= EMAIL_VERIFICATION_OPTIONS.maxAttempts &&
          payload.firstAttemptTimestamp +
            EMAIL_VERIFICATION_OPTIONS.maxAttempsTimePeriod <=
            Date.now()
        ) {
          await this.node.storage.delete(`${code}`)
        }
      }
    }

    const creationTimestamp = Date.now()
    const code = generateRandomString(
      EMAIL_VERIFICATION_OPTIONS.codeLength
    ).toUpperCase()
    const payload = {
      state,
      creationTimestamp,
      numberOfAttempts: numberOfAttempts + 1,
      firstAttemptTimestamp: firstAttemptTimestamp
        ? firstAttemptTimestamp
        : creationTimestamp,
    }

    this.node.class.setNodeType(NodeType.Email)
    this.node.class.setType(EmailAddressType.Email)
    await this.node.storage.put(`${CODES_KEY_NAME}/${code}`, payload)
    await this.node.storage.setAlarm(
      creationTimestamp + EMAIL_VERIFICATION_OPTIONS.ttlInMs
    )

    return code
  }

  async verifyCode(code: string, state: string): Promise<boolean> {
    const verificationPayloads =
      await this.node.storage.list<VerificationPayload>({
        start: `${CODES_KEY_NAME}/`,
      })

    const emailVerification = verificationPayloads
      ? verificationPayloads.get(`${CODES_KEY_NAME}/${code}`)
      : undefined
    if (
      !verificationPayloads ||
      !emailVerification ||
      state !== emailVerification.state
    ) {
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

    await this.node.storage.delete(`${CODES_KEY_NAME}/${code}`)

    return true
  }

  static async alarm(address: Address) {
    const verificationPayloads =
      await address.state.storage.list<VerificationPayload>({
        start: `${CODES_KEY_NAME}/`,
      })

    for (const [code, payload] of verificationPayloads.entries()) {
      if (
        // we only have delayStartTimestamp if the limit of 5 attempts was hit
        // this is how we check if the limit was hit and delete node
        payload.delayStartTimestamp &&
        payload.delayStartTimestamp +
          EMAIL_VERIFICATION_OPTIONS.regenDelayForMaxAttepmtsInMs <=
          Date.now()
      ) {
        await address.state.storage.deleteAll()
      }
      if (
        payload.creationTimestamp + EMAIL_VERIFICATION_OPTIONS.ttlInMs <=
        Date.now()
      ) {
        await address.state.storage.delete(`${CODES_KEY_NAME}/${code}`)
      }
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
