import { keccak256, recoverAddress, type Hex } from 'viem'

import {
  CryptoAccountType,
  EmailAccountType,
  HandleAccountType,
  NodeType,
  OAuthAccountType,
  WebauthnAccountType,
} from '@proofzero/types/account'
import { AccountURNSpace } from '@proofzero/urns/account'
import { generateHashedIDRef } from '@proofzero/urns/idref'

export const isNodeType = (type: string): type is NodeType => {
  switch (type) {
    case NodeType.Crypto:
    case NodeType.Contract:
    case NodeType.OAuth:
    case NodeType.Email:
    case NodeType.WebAuthN:
    case NodeType.Handle:
      return true
    default:
      return false
  }
}

export const isCryptoAccountType = (type: string | undefined) => {
  switch (type) {
    case CryptoAccountType.ETH:
      return NodeType.Crypto
    default:
      return false
  }
}

export const isOAuthAccountType = (type: string | undefined) => {
  switch (type) {
    case OAuthAccountType.GitHub:
    case OAuthAccountType.Microsoft:
    case OAuthAccountType.Twitter:
    case OAuthAccountType.Google:
    case OAuthAccountType.Apple:
    case OAuthAccountType.Discord:
      return NodeType.OAuth
    default:
      return false
  }
}

export const isEmailAccountType = (type: string | undefined) => {
  switch (type) {
    case EmailAccountType.Email:
    case EmailAccountType.Mask:
      return NodeType.Email
    default:
      return false
  }
}
export const isWebauthnAccountType = (type: string | undefined) => {
  switch (type) {
    case WebauthnAccountType.WebAuthN:
      return NodeType.WebAuthN
    default:
      return false
  }
}

export const isHandleAccountType = (type: string) => {
  switch (type) {
    case HandleAccountType.Handle:
      return NodeType.Handle
    default:
      return false
  }
}

export const isValidAccountType = (type: string) => {
  return (
    isCryptoAccountType(type) ||
    isOAuthAccountType(type) ||
    isEmailAccountType(type) ||
    isWebauthnAccountType(type) ||
    isHandleAccountType(type)
  )
}

export const recoverEthereumAddress = (
  message: string,
  signature: Hex
): Promise<string> => {
  const prefix = `\u0019Ethereum Signed Message:\n${message.length}`
  const encoder = new TextEncoder()
  const bytes = encoder.encode(`${prefix}${message}`)
  const hash = keccak256(bytes)
  return recoverAddress({ hash, signature })
}

export const generateSmartWalletAccountUrn = (
  address: string,
  nickname: string
) => {
  const accountURN = AccountURNSpace.componentizedUrn(
    generateHashedIDRef(CryptoAccountType.Wallet, address),
    {
      node_type: NodeType.Crypto,
      addr_type: CryptoAccountType.Wallet,
    },
    { alias: nickname, hidden: 'true' }
  )
  const baseAccountURN = AccountURNSpace.getBaseURN(accountURN)
  return { accountURN, baseAccountURN }
}
