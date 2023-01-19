import { hexlify } from '@ethersproject/bytes'
import { randomBytes } from '@ethersproject/random'

import { NONCE_OPTIONS } from '../constants'
import type { Challenge, CryptoAddressProfile } from '../types'
import { recoverEthereumAddress } from '../utils'

import { AddressNode } from '.'
import Address from './address'
import ENSUtils from '@kubelt/platform-clients/ens-utils'

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

  async getProfile(): Promise<CryptoAddressProfile> {
    const [nickname, gradient, address] = await Promise.all([
      this.node.storage.get<string>('nickname'),
      this.node.storage.get<string>('gradient'),
      this.node.storage.get<string>('address'),
    ])

    if (!address) throw new Error('address not found')

    const profile = await getCryptoAddressProfile(address as string)

    if (!profile.avatar) {
      profile.avatar = gradient
    }

    if (!profile.displayName) {
      profile.displayName = nickname || address
    }

    return profile
  }

  static async alarm(address: Address) {
    const challenges: Record<string, Challenge> =
      (await address.state.storage.get('challenges')) || {}
    for (const [nonce, challenge] of Object.entries(challenges)) {
      if (challenge.timestamp + NONCE_OPTIONS.ttl * 1000 <= Date.now()) {
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
  console.log('getCryptoAddressProfile: address', address)
  const { avatar, displayName } = await ensClient.getEnsEntry(address)

  const newProfile: CryptoAddressProfile = {
    address: address,
    displayName: displayName || address,
    avatar: avatar || '',
  }

  return newProfile
}
