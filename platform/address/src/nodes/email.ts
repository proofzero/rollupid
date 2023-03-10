import generateRandomString from '@kubelt/utils/generateRandomString'
import { DurableObjectStubProxy } from 'do-proxy'
import { AddressNode } from '.'
import { EMAIL_VERIFICATION_OPTIONS } from '../constants'
import Address from './address'

type EmailVerification = {
  address: string
  //Other things will need to go here, like redirectUri, scope, state, timestamp
}

export default class EmailAddress {
  declare node: AddressNode

  constructor(node: AddressNode) {
    this.node = node
  }

  async generateVerificationCode(address: string): Promise<string> {
    const code = generateRandomString(8)
    const verificationCodes =
      (await this.node.storage.get<Record<string, EmailVerification>>(
        'codes'
      )) || {}

    verificationCodes[code] = {
      address,
    }

    await this.node.storage.put('codes', verificationCodes)
    await this.node.storage.setAlarm(
      Date.now() + EMAIL_VERIFICATION_OPTIONS.ttlInMs
    )

    return code
  }

  async verifyCode(code: string): Promise<EmailVerification> {
    const codes =
      (await this.node.storage.get<Record<string, EmailVerification>>(
        'codes'
      )) || {}
    const emailVerification = codes ? codes[code] : undefined
    if (!codes || !emailVerification)
      throw new Error('Verification code did not match.')

    delete codes[code]

    await this.node.storage.put('codes', codes)

    return emailVerification
  }

  static async alarm(address: Address) {
    console.log({ alarm: 'oauth' })
  }
}
export type EmailAddressProxyStub = DurableObjectStubProxy<EmailAddress>
