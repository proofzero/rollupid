import {
  NodeType,
  OAuthAddressType,
  EmailAddressType,
  CryptoAddressType,
} from '@proofzero/types/address'

import type { Addresses } from '@proofzero/platform.account/src/types'
import { AddressURN } from '@proofzero/urns/address'
import type { GetAddressProfileResult } from '@proofzero/platform.address/src/jsonrpc/methods/getAddressProfile'

export enum OptionType {
  AddNew,
  None,
}

export type EmailSelectListItem = {
  email: string
  type: OAuthAddressType | EmailAddressType | OptionType
  addressURN?: AddressURN
}

export type SCWalletSelectListItem = {
  title: string
  type: CryptoAddressType | OptionType
  addressURN: AddressURN
  cryptoAddress?: string
}

export const getNormalisedConnectedEmails = (
  connectedAddresses?: Addresses | null
): EmailSelectListItem[] => {
  if (!connectedAddresses) return []
  return connectedAddresses
    .filter((address) => {
      return (
        (address.rc.node_type === NodeType.OAuth &&
          (address.rc.addr_type === OAuthAddressType.Google ||
            address.rc.addr_type === OAuthAddressType.Microsoft ||
            address.rc.addr_type === OAuthAddressType.Apple)) ||
        (address.rc.node_type === NodeType.Email &&
          address.rc.addr_type === EmailAddressType.Email)
      )
    })
    .map((address) => {
      return {
        type: address.rc.addr_type as OAuthAddressType | EmailAddressType,
        email: address.qc.alias,
        addressURN: address.baseUrn as AddressURN,
      }
    })
}

export const getNormalisedSmartContractWallets = (
  connectedAddresses?: GetAddressProfileResult[] | null
): SCWalletSelectListItem[] => {
  if (!connectedAddresses) return []
  return connectedAddresses.map((address) => {
    return {
      title: address.title,
      type: address.type as CryptoAddressType.Wallet,
      addressURN: address.id as AddressURN,
      cryptoAddress: address.address,
    }
  })
}
