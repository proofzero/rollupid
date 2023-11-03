import { hexlify } from '@ethersproject/bytes'
import { randomBytes } from '@ethersproject/random'

import type { Scope } from '@proofzero/types/authorization'
import { CryptoAccountType } from '@proofzero/types/account'

import { NONCE_OPTIONS } from '../constants'
import type { AccountProfile, Challenge } from '../types'
import { recoverEthereumAddress } from '../utils'

import { AccountNode } from '.'
import Account from './account'
import ENSUtils from '@proofzero/platform-clients/ens-utils'

type CryptoAccountProfile = AccountProfile<CryptoAccountType.ETH>

export default class CryptoAccount {
  declare node: AccountNode

  constructor(node: AccountNode) {
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

  async getProfile(): Promise<CryptoAccountProfile> {
    const [nickname, gradient, address] = await Promise.all([
      this.node.class.getNickname(),
      this.node.class.getGradient(),
      this.node.class.getAddress(),
    ])

    if (!address) throw new Error('account not found')

    const profile = await getCryptoAccountProfile(address)
    profile.icon = profile.icon || gradient

    if (profile.title.startsWith('0x') && nickname) {
      profile.title = nickname
    }

    profile.title = profile.title || address

    return profile
  }

  static async alarm(account: Account) {
    const challenges: Record<string, Challenge> =
      (await account.state.storage.get('challenges')) || {}
    for (const [nonce, challenge] of Object.entries(challenges)) {
      if (challenge.timestamp + NONCE_OPTIONS.ttl <= Date.now()) {
        delete challenges[nonce]
      }
    }
    await account.state.storage.put('challenges', challenges)
  }
}

const getCryptoAccountProfile = async (
  address: string
): Promise<CryptoAccountProfile> => {
  const ensClient = new ENSUtils()
  const profile = await ensClient.getEnsEntry(address)

  return {
    address,
    title: profile?.displayName || '',
    icon: profile?.avatar || '',
    type: CryptoAccountType.ETH,
  }
}
