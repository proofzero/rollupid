import { keccak256 } from '@ethersproject/keccak256'
import { recoverPublicKey } from '@ethersproject/signing-key'
import { computeAddress } from '@ethersproject/transactions'

import {
  CryptoAddressType,
  EmailAddressType,
  HandleAddressType,
  NodeType,
  OAuthAddressType,
} from '@kubelt/types/address'

export const isNodeType = (type: string): type is NodeType => {
  switch (type) {
    case NodeType.Crypto:
    case NodeType.Contract:
    case NodeType.OAuth:
    case NodeType.Email:
    case NodeType.Handle:
      return true
    default:
      return false
  }
}

export const isCryptoAddressType = (type: string | undefined) => {
  switch (type) {
    case CryptoAddressType.ETH:
      return NodeType.Crypto
    default:
      return false
  }
}

export const isOAuthAddressType = (type: string | undefined) => {
  switch (type) {
    case OAuthAddressType.GitHub:
    case OAuthAddressType.Microsoft:
    case OAuthAddressType.Twitter:
    case OAuthAddressType.Google:
    case OAuthAddressType.Apple:
    case OAuthAddressType.Discord:
      return NodeType.OAuth
    default:
      return false
  }
}

export const isEmailAddressType = (type: string | undefined) => {
  switch (type) {
    case EmailAddressType.Email:
      return NodeType.Email
    default:
      return false
  }
}

export const isHandleAddressType = (type: string) => {
  switch (type) {
    case HandleAddressType.Handle:
      return NodeType.Handle
    default:
      return false
  }
}

export const isValidAddressType = (type: string) => {
  return (
    isCryptoAddressType(type) ||
    isOAuthAddressType(type) ||
    isEmailAddressType(type) ||
    isHandleAddressType(type)
  )
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
