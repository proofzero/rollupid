import { hexlify } from '@ethersproject/bytes'
import { randomBytes } from '@ethersproject/random'

import type { Scope } from '@proofzero/types/access'
import { CryptoAddressType } from '@proofzero/types/address'

import { NONCE_OPTIONS } from '../constants'
import type { AddressProfile, Challenge } from '../types'
import { recoverEthereumAddress } from '../utils'

import { AddressNode } from '.'
import Address from './address'
import ENSUtils from '@proofzero/platform-clients/ens-utils'

type CryptoAddressProfile = AddressProfile<CryptoAddressType.ETH>

export default class CryptoAddress {
  declare node: AddressNode

  constructor(node: AddressNode) {
    this.node = node
  }

  async getNonce(
    address: string,
    template: string,
    redirectUri: string,
    scope: Scope,
    state: string
  ): Promise<string> {
    const nonce = hexlify(randomBytes(NONCE_OPTIONS.length))
    const timestamp = Date.now()

    const challenges =
      (await this.node.storage.get<Record<string, Challenge>>('challenges')) ||
      {}
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
    await this.node.storage.put('challenges', challenges)
    await this.node.storage.setAlarm(Date.now() + NONCE_OPTIONS.ttl)

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
    await this.node.storage.put('challenges', challenges)

    return challenge
  }

  async getProfile(): Promise<CryptoAddressProfile> {
    const [nickname, gradient, address] = await Promise.all([
      this.node.class.getNickname(),
      this.node.class.getGradient(),
      this.node.class.getAddress(),
    ])

    if (!address) throw new Error('address not found')

    const profile = await getCryptoAddressProfile(address)
    profile.icon = profile.icon || gradient

    if (profile.title.startsWith('0x') && nickname) {
      profile.title = nickname
    }

    profile.title = profile.title || address

    return profile
  }

  static async alarm(address: Address) {
    const challenges: Record<string, Challenge> =
      (await address.state.storage.get('challenges')) || {}
    for (const [nonce, challenge] of Object.entries(challenges)) {
      if (challenge.timestamp + NONCE_OPTIONS.ttl <= Date.now()) {
        delete challenges[nonce]
      }
    }
    await address.state.storage.put('challenges', challenges)
  }
}

const getCryptoAddressProfile = async (
  address: string
): Promise<CryptoAddressProfile> => {
  const ensClient = new ENSUtils()
  const { avatar, displayName } = await ensClient.getEnsEntry(address)

  return {
    address: address,
    title: displayName || '',
    icon: avatar || '',
    type: CryptoAddressType.ETH,
  }
}
