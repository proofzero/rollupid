import { BytesLike, hexlify } from '@ethersproject/bytes'
import { keccak256 } from '@ethersproject/keccak256'
import { randomBytes } from '@ethersproject/random'
import { recoverPublicKey } from '@ethersproject/signing-key'
import { computeAddress } from '@ethersproject/transactions'

import { DurableObject } from '@kubelt/platform.commons'
import { gatewayFromIpfs } from '@kubelt/platform.commons/src/utils'

import { NONCE_OPTIONS } from './constants'
import {
  Challenge,
  AddressCoreApi,
  Environment,
  CryptoAddressType,
  CryptoCoreApi,
  AddressProfile,
} from './types'
import { getNftarVoucher } from './utils'
export default class Core extends DurableObject<Environment, AddressCoreApi> {
  address: string | undefined
  profile: AddressProfile | undefined

  constructor(state: DurableObjectState, env: Environment) {
    super(state, env)
    // TODO: what else should we bootstrap into memory?
    this.state.blockConcurrencyWhile(async () => {
      this.profile = await this.storage.get('profile')
    })
  }

  methods(): AddressCoreApi | CryptoCoreApi {
    let coreApi: AddressCoreApi = {
      getType: this.getType.bind(this),
      setType: this.setType.bind(this),
      getName: this.getName.bind(this),
      setName: this.setName.bind(this),
      getAddress: this.getAddress.bind(this),
      setAddress: this.setAddress.bind(this),
      setAccount: this.setAccount.bind(this),
      unsetAccount: this.unsetAccount.bind(this),
      resolveAccount: this.resolveAccount.bind(this),
    }

    const cryptoCoreApi: CryptoCoreApi = {
      ...coreApi,
      getNonce: this.getNonce.bind(this),
      verifyNonce: this.verifyNonce.bind(this),
      setProfile: this.setProfile.bind(this),
      getProfile: this.getProfile.bind(this),
      setPfpVoucher: this.setPfpVoucher.bind(this),
      getPfpVoucher: this.getPfpVoucher.bind(this),
    }

    if (
      this.coreType &&
      Object.values(CryptoAddressType).includes(
        this.coreType as CryptoAddressType
      )
    ) {
      coreApi = cryptoCoreApi
    }
    return coreApi
  }

  getAddress(): string | undefined {
    return this.address || this.coreName
  }

  async setAddress(address: string): Promise<void> {
    this.setName(address)
    this.address = address
    await this.storage.put({ address })
  }

  async setAccount(account: string): Promise<void> {
    await this.storage.put({ account })
  }

  async unsetAccount(): Promise<void> {
    await this.storage.deleteAll()
  }

  async resolveAccount(): Promise<string | undefined> {
    return this.storage.get<string>('account')
  }

  async setProfile(profile: AddressProfile): Promise<void> {
    this.profile = { ...this.profile, ...profile }
    await this.storage.put(this.profile)
  }

  async getProfile(): Promise<AddressProfile | undefined> {
    if (!this.profile && this.address) {
      const ensRes = await fetch(
        `https://api.ensideas.com/ens/resolve/${this.address}`
      )
      const {
        avatar,
        displayName,
      }: {
        avatar: string | null
        displayName: string | null
      } = await ensRes.json()

      const defaultProfile: AddressProfile = {
        displayName: displayName || this.address,
        pfp: {
          url: avatar,
          isToken: !!avatar,
        },
        cover: undefined,
      }

      // because this is a new address we don't have to check if one already exists
      const voucher = await getNftarVoucher(this.address)
      // convert and prime the gateway
      const pfp = gatewayFromIpfs(voucher.metadata.image)
      const cover = gatewayFromIpfs(voucher.metadata.cover)

      defaultProfile.pfp.url ||= pfp
      defaultProfile.cover = cover

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
    const subject = this.computeAddress(publicKey)

    if (subject != challenge.clientId) {
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
