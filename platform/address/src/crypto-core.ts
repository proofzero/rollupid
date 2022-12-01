import { hexlify, BytesLike } from '@ethersproject/bytes'
import { keccak256 } from '@ethersproject/keccak256'
import { randomBytes } from '@ethersproject/random'
import { recoverPublicKey } from '@ethersproject/signing-key'
import { computeAddress } from '@ethersproject/transactions'

import { gatewayFromIpfs } from '@kubelt/platform.commons/src/utils'

import { NONCE_OPTIONS } from './constants'
import Core from './core'
import {
  Challenge,
  AddressCoreApi,
  Environment,
  CryptoCoreApi,
  AddressProfile,
  CryptoAddressType,
  AddressType,
} from './types'
import { AddressURNSpace } from './urns'
import { getNftarVoucher, resolveEthType } from './utils'

export default class CryptoCore extends Core {
  profile: AddressProfile | undefined

  constructor(state: DurableObjectState, env: Environment) {
    super(state, env)
    // TODO: what else should we bootstrap into memory?
    this.state.blockConcurrencyWhile(async () => {
      this.profile = await this.storage.get('profile')
    })
  }

  methods(): AddressCoreApi & CryptoCoreApi {
    const cryptoCoreApi: CryptoCoreApi = {
      ...this.coreApi,
      getNonce: this.getNonce.bind(this),
      verifyNonce: this.verifyNonce.bind(this),
      setProfile: this.setProfile.bind(this),
      getProfile: this.getProfile.bind(this),
      setPfpVoucher: this.setPfpVoucher.bind(this),
      getPfpVoucher: this.getPfpVoucher.bind(this),
    }

    return cryptoCoreApi
  }

  static async validateAddress(
    address: string,
    addressType: AddressType | undefined
  ): Promise<{ address: string; addressType: AddressType }> {
    switch (addressType) {
      case CryptoAddressType.ETHEREUM:
      case CryptoAddressType.ETH:
      case undefined:
      case null: {
        const resolvedType = await resolveEthType(address) // we may see an ens descriptor if address is unknown
        if (!resolvedType) {
          throw `could not resolve ethereum address type from ${address}`
        }
        address = resolvedType.address
        addressType = CryptoAddressType.ETH
        break
      }
      default:
        throw `unsupported address type ${addressType}`
    }
    return { address, addressType }
  }

  async setProfile(profile: AddressProfile): Promise<void> {
    this.profile = { ...this.profile, ...profile }
    await this.storage.put(this.profile)
  }

  async getProfile(): Promise<AddressProfile | undefined> {
    const address = await this.getAddress()
    if (!this.profile && address) {
      console.log('setting default profile')

      const ensRes = await fetch(
        `https://api.ensideas.com/ens/resolve/${address}`
      )
      const {
        avatar,
        displayName,
      }: {
        avatar: string | null
        displayName: string | null
      } = await ensRes.json()

      const defaultProfile: AddressProfile = {
        displayName: displayName || address,
        pfp: {
          image: avatar || '',
          isToken: !!avatar,
        },
        cover: undefined,
      }

      const addressType = await this.getType()

      // because this is a new address we don't have to check if one already exists
      const voucher = await getNftarVoucher(address, addressType, this.env)
      // convert and prime the gateway
      const pfp = gatewayFromIpfs(voucher.metadata.image)
      const cover = gatewayFromIpfs(voucher.metadata.cover)

      defaultProfile.pfp.image ||= pfp as string
      defaultProfile.cover = cover

      console.log('setting default profile to: ', defaultProfile)

      await this.setPfpVoucher(voucher) // set mint pfp voucher for this address
      await this.setProfile(defaultProfile) // overload address profile
    }
    return this.profile
  }

  async setPfpVoucher(voucher: object): Promise<void> {
    await this.storage.put({ voucher })
  }

  async getPfpVoucher(): Promise<object | undefined> {
    return await this.storage.get('voucher')
  }

  async getNonce(
    template: string,
    clientId: string,
    redirectUri: string,
    scope: string[],
    state: string
  ): Promise<string> {
    if (!template) {
      throw 'missing template'
    }

    if (typeof template != 'string') {
      throw 'template is not a string'
    }

    if (!template.includes('{{nonce}}')) {
      throw 'template missing nonce variable'
    }

    if (!clientId) {
      throw 'missing client id'
    }

    const nonce = hexlify(randomBytes(NONCE_OPTIONS.length))

    const challenge: Challenge = {
      nonce,
      template,
      clientId,
      redirectUri,
      scope,
      state,
    }

    await this.storage.put(`challenge/${nonce}`, challenge)

    if (NONCE_OPTIONS.ttl) {
      // The nonce is temporarily persisted to avoid memory evictions.
      setTimeout(() => {
        this.storage.delete(`challenge/${nonce}`)
      }, NONCE_OPTIONS.ttl * 1000)
    }

    return nonce
  }

  async verifyNonce(nonce: string, signature: string): Promise<Challenge> {
    const challenge = await this.storage.get<Challenge>(`challenge/${nonce}`)

    if (!challenge) {
      throw 'challenge not found'
    }

    await this.storage.delete(`challenge/${nonce}`)

    const message = challenge.template.slice().replace(/{{nonce}}/, nonce)
    const publicKey = this.recoverPublicKey(message, signature)
    const address = this.computeAddress(publicKey)

    if (address != challenge.clientId) {
      throw 'not matching address'
    }

    if (nonce !== challenge.nonce) {
      throw 'not matching nonce'
    }

    return challenge
  }

  recoverPublicKey(message: string, signature: string): string {
    const prefix = `\u0019Ethereum Signed Message:\n${message.length}`
    const encoder = new TextEncoder()
    const bytes = encoder.encode(`${prefix}${message}`)
    const digest = keccak256(bytes)
    return recoverPublicKey(digest, signature)
  }

  computeAddress(publicKey: BytesLike): string {
    return computeAddress(publicKey)
  }
}
