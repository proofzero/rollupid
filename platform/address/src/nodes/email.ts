import generateRandomString from '@kubelt/utils/generateRandomString'
import { DurableObjectStubProxy } from 'do-proxy'
import { AddressNode } from '.'
import { EMAIL_VERIFICATION_OPTIONS } from '../constants'
import Address from './address'

type EmailVerification = {
  state: string
  //Other things will need to go here, like redirectUri, scope, state, timestamp
}

export default class EmailAddress {
  declare node: AddressNode

  constructor(node: AddressNode) {
    this.node = node
  }

  async generateVerificationCode(state: string): Promise<string> {
    const code = generateRandomString(8)
    const verificationCodes =
      (await this.node.storage.get<Record<string, EmailVerification>>(
        'codes'
      )) || {}

    verificationCodes[code] = {
      state,
    }

    await this.node.storage.put('codes', verificationCodes)
    await this.node.storage.setAlarm(
      Date.now() + EMAIL_VERIFICATION_OPTIONS.ttlInMs
    )

    return code
  }

  async verifyCode(code: string, state: string): Promise<boolean> {
    const codes =
      (await this.node.storage.get<Record<string, EmailVerification>>(
        'codes'
      )) || {}
    const emailVerification = codes ? codes[code] : undefined
    if (!codes || !emailVerification || state !== emailVerification.state) {
      console.log('OTP verification code and state did not match')
      return false
    }

    delete codes[code]

    await this.node.storage.put('codes', codes)

    return true
  }

  static async alarm(address: Address) {
    //TODO: have to fix alarm
    console.log('Alarm for email', { alarm: 'oauth' })
  }
}
export type EmailAddressProxyStub = DurableObjectStubProxy<EmailAddress>
