import email from '@kubelt/platform-clients/email'
import { EmailAddressType, NodeType } from '@kubelt/types/address'
import generateRandomString from '@kubelt/utils/generateRandomString'
import { DurableObjectStubProxy } from 'do-proxy'
import { AddressNode } from '.'
import { EMAIL_VERIFICATION_OPTIONS } from '../constants'
import Address from './address'

type EmailVerification = {
  state: string
  codeExpiry: number
  //Other things will need to go here, like redirectUri, scope, state, timestamp
}

const CODES_KEY_NAME = 'codes'

export default class EmailAddress {
  declare node: AddressNode

  constructor(node: AddressNode) {
    this.node = node
  }

  async generateVerificationCode(state: string): Promise<string> {
    const codeExpiry = Date.now() + EMAIL_VERIFICATION_OPTIONS.ttlInMs
    const code = generateRandomString(8)
    const verificationCodes =
      (await this.node.storage.get<Record<string, EmailVerification>>(
        CODES_KEY_NAME
      )) || {}

    verificationCodes[code] = {
      state,
      codeExpiry,
    }

    this.node.class.setNodeType(NodeType.Email)
    this.node.class.setType(EmailAddressType.Email)
    await this.node.storage.put(CODES_KEY_NAME, verificationCodes)
    await this.node.storage.setAlarm(codeExpiry)

    return code
  }

  async verifyCode(code: string, state: string): Promise<boolean> {
    const codes =
      (await this.node.storage.get<Record<string, EmailVerification>>(
        CODES_KEY_NAME
      )) || {}
    const emailVerification = codes ? codes[code] : undefined
    if (!codes || !emailVerification || state !== emailVerification.state) {
      console.log('OTP verification code and state did not match')
      return false
    }

    if (emailVerification.codeExpiry <= Date.now()) {
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
      (await address.state.storage.get<Record<string, EmailVerification>>(
        CODES_KEY_NAME
      )) || {}
    for (const [code, verification] of Object.entries(codes)) {
      if (verification.codeExpiry <= Date.now()) {
        delete codes[code]
      }
    }
    await address.state.storage.put(CODES_KEY_NAME, codes)
  }
}
export type EmailAddressProxyStub = DurableObjectStubProxy<EmailAddress>
