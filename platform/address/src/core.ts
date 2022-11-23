import { BytesLike, hexlify } from '@ethersproject/bytes'
import { keccak256 } from '@ethersproject/keccak256'
import { randomBytes } from '@ethersproject/random'
import { recoverPublicKey } from '@ethersproject/signing-key'
import { computeAddress } from '@ethersproject/transactions'

import { DurableObject } from '@kubelt/platform.commons'

import { NONCE_OPTIONS } from './constants'
import { Challenge, CoreApi, Environment } from './types'
import { getType } from './utils'

export default class Core extends DurableObject<Environment, CoreApi> {
  methods(): CoreApi {
    return {
      kb_setAddress: this.setAddress.bind(this),
      kb_deleteAddress: this.delete.bind(this),
      kb_resolveAddress: this.resolve.bind(this),
      kb_getNonce: this.getNonce.bind(this),
      kb_verifyNonce: this.verifyNonce.bind(this),
    }
  }

  async setAddress(address: string, coreId: string): Promise<void> {
    const type = getType(address)
    await this.storage.put({ address, type, coreId })
  }

  async delete(): Promise<void> {
    await this.storage.deleteAll()
  }

  async resolve(): Promise<string | undefined> {
    return this.storage.get<string>('coreId')
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
