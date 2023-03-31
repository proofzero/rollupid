import { BadRequestError } from '@proofzero/errors'
import { EmailAddressType, NodeType } from '@proofzero/types/address'
import generateRandomString from '@proofzero/utils/generateRandomString'
import { DurableObjectStubProxy } from 'do-proxy'
import { AddressNode } from '.'
import { EMAIL_VERIFICATION_OPTIONS } from '../constants'
import { EmailAddressProfile } from '../types'
import Address from './address'

type VerificationPayload = {
  state: string
  creationTimestamp: number
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

    for (const [_, payload] of Object.entries(verificationCodes)) {
      if (
        payload.creationTimestamp + EMAIL_VERIFICATION_OPTIONS.regenDelayInMs >
        Date.now()
      )
        throw new BadRequestError({
          message: `Cannot generate new code for the address. You can only generate a new code once every ${
            EMAIL_VERIFICATION_OPTIONS.regenDelayInMs / 1000
          } seconds`,
        })
    }

    const creationTimestamp = Date.now()
    const code = generateRandomString(
      EMAIL_VERIFICATION_OPTIONS.codeLength
    ).toUpperCase()
    verificationCodes[code] = {
      state,
      creationTimestamp,
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
      // times of all of those codes. Alarms will still clean them up eventually.
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
    const result: EmailAddressProfile = {
      address,
      email: address,
      isEmail: true,
      name: nickname ?? address,
      picture: gradient,
    }
    return result
  }
}
export type EmailAddressProxyStub = DurableObjectStubProxy<EmailAddress>
