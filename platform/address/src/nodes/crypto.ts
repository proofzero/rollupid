import { hexlify } from '@ethersproject/bytes'
import { randomBytes } from '@ethersproject/random'

import { NONCE_OPTIONS } from '../constants'
import type { Challenge, NFTarVoucher } from '../types'
import { recoverEthereumAddress } from '../utils'

import { AddressNode } from '.'
import { DurableObjectStubProxy } from 'do-proxy'
import Address from './address'

export default class CryptoAddress {
  declare node: AddressNode

  constructor(node: AddressNode) {
    this.node = node
  }

  async getNonce(
    address: string,
    template: string,
    redirectUri: string,
    scope: string[],
    state: string
  ): Promise<string> {
    const nonce = hexlify(randomBytes(NONCE_OPTIONS.length))
    const timestamp = Date.now()

    const challenges =
      (await this.node.storage.get<Record<string, Challenge>>('challenges')) ||
      {}
    console.log({ challenges })
    // const challenges: Map<string, Challenge> =
    //   (await this.node.storage.get('challenges')) || new Map()
    challenges[nonce] = {
      address,
      template,
      redirectUri,
      scope,
      state,
      timestamp,
    }
    this.node.storage.put('challenges', challenges)
    this.node.storage.setAlarm(NONCE_OPTIONS.ttl)

    return nonce
  }

  async verifyNonce(nonce: string, signature: string): Promise<Challenge> {
    const challenges: Record<string, Challenge> =
      (await this.node.storage.get<Record<string, Challenge>>('challenges')) ||
      {}
    const challenge = challenges[nonce]

    if (!challenge) {
      throw new Error('not matching nonce')
    }

    const message = challenge.template.slice().replace(/{{nonce}}/, nonce)
    const address = recoverEthereumAddress(message, signature)

    if (address != challenge.address) {
      throw new Error('not matching address')
    }

    delete challenges[nonce]
    this.node.storage.put('challenges', challenges)

    return challenge
  }

  async setVoucher(voucher: NFTarVoucher): Promise<void> {
    return await this.node.storage.put('voucher', voucher)
  }

  async getVoucher(): Promise<NFTarVoucher | undefined> {
    return await this.node.storage.get<NFTarVoucher>('voucher')
  }

  static async alarm(address: Address) {
    const challenges: Map<string, Challenge> =
      (await address.state.storage.get('challenges')) || new Map()
    for (const [nonce, challenge] of challenges) {
      if (challenge.timestamp + NONCE_OPTIONS.ttl * 1000 <= Date.now()) {
        challenges.delete(nonce)
      }
    }
    await address.state.storage.put('challenges', challenges)
  }
}
