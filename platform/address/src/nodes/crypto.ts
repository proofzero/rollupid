import { hexlify } from '@ethersproject/bytes'
import { randomBytes } from '@ethersproject/random'
import { AddressURN } from '@kubelt/urns/address'

import { NONCE_OPTIONS } from '../constants'
import type { Challenge, CryptoAddressType } from '../types'
import { recoverEthereumAddress } from '../utils'
import Address from './address'
export default class CryptoAddress extends Address {
  async getType(): Promise<CryptoAddressType> {
    return (await super.getType()) as CryptoAddressType
  }

  async getNonce(
    address: AddressURN,
    template: string,
    redirectUri: string,
    scope: string[],
    state: string
  ): Promise<string> {
    const nonce = hexlify(randomBytes(NONCE_OPTIONS.length))
    const timestamp = Date.now()

    const challenges: Map<string, Challenge> =
      (await this.state.storage.get('challenges')) || new Map()
    challenges.set(nonce, {
      address,
      template,
      redirectUri,
      scope,
      state,
      timestamp,
    })
    this.state.storage.put('challenges', challenges)
    this.state.storage.setAlarm(NONCE_OPTIONS.ttl)

    return nonce
  }

  async verifyNonce(nonce: string, signature: string): Promise<Challenge> {
    const challenges: Map<string, Challenge> =
      (await this.state.storage.get('challenges')) || new Map()
    const challenge = challenges.get(nonce)

    if (!challenge) {
      throw new Error('not matching nonce')
    }

    const message = challenge.template.slice().replace(/{{nonce}}/, nonce)
    const address = recoverEthereumAddress(message, signature)

    if (address != challenge.address) {
      throw new Error('not matching address')
    }

    challenges.delete(nonce)
    this.state.storage.put('challenges', challenges)

    return challenge
  }

  async getPfpVoucher(): Promise<unknown> {
    return await this.state.storage.get('pfpVoucher')
  }

  async setPfpVoucher(voucher: unknown): Promis<void> {
    return await this.state.storage.put('pfpVoucher', voucher)
  }

  async alarm() {
    const challenges: Map<string, Challenge> =
      (await this.state.storage.get('challenges')) || new Map()
    for (const [nonce, challenge] of challenges) {
      if (challenge.timestamp + NONCE_OPTIONS.ttl * 1000 <= Date.now()) {
        challenges.delete(nonce)
      }
    }
    await this.state.storage.put('challenges', challenges)
  }
}
