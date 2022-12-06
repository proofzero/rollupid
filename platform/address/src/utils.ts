import { keccak256 } from '@ethersproject/keccak256'
import { recoverPublicKey } from '@ethersproject/signing-key'
import { computeAddress } from '@ethersproject/transactions'

import { CryptoAddressType, NodeType } from './types'

export const isNodeType = (type: string): type is NodeType => {
  switch (type) {
    case NodeType.Crypto:
      return true
    default:
      return false
  }
}

export const isCryptoAddressType = (
  type: string
): type is CryptoAddressType => {
  switch (type) {
    case CryptoAddressType.Ethereum:
      return true
    default:
      return false
  }
}

export const recoverEthereumAddress = (
  message: string,
  signature: string
): string => {
  const prefix = `\u0019Ethereum Signed Message:\n${message.length}`
  const encoder = new TextEncoder()
  const bytes = encoder.encode(`${prefix}${message}`)
  const digest = keccak256(bytes)
  return computeAddress(recoverPublicKey(digest, signature))
}
