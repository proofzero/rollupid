/*
   Zero Knowledge Authentication

   This module implements zero-knowledge proof for authentication.
 */

import { BytesLike, hexlify } from '@ethersproject/bytes'
import { keccak256 } from '@ethersproject/keccak256'
import { recoverPublicKey } from '@ethersproject/signing-key'
import { computeAddress } from '@ethersproject/transactions'

import { DurableObject } from '@kubelt/platform.commons/src'

import { NONCE_OPTIONS } from './constants'
import { CoreApi as Api, Challenge, Environment } from './types'

export default class Core extends DurableObject<Environment, Api> {
  methods(): Api {
    return {
      getNonce: this.getNonce.bind(this),
      verifyNonce: this.verifyNonce.bind(this),
    }
  }

  async getNonce(
    address: string,
    template: string,
    clientId: string,
    redirectUri: string,
    scope: string[],
    state: string
  ): Promise<string> {
    if (!address) {
      throw 'missing address'
    }

    if (!template) {
      throw 'missing template'
    }

    if (typeof template != 'string') {
      throw 'template is not a string'
    }

    if (!template.includes('{{nonce}}')) {
      throw 'template missing nonce variable'
    }

    const buffer = new Uint8Array(NONCE_OPTIONS.length)
    const nonce = hexlify(crypto.getRandomValues(buffer))

    const challenge: Challenge = {
      address,
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

    if (subject != challenge.address) {
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
