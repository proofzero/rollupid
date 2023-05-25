import React from "react"

import {
  NodeType,
  OAuthAddressType,
  EmailAddressType,
  CryptoAddressType,
} from '@proofzero/types/address'

import { HiOutlineEnvelope } from 'react-icons/hi2'

import googleIcon from '@proofzero/design-system/src/assets/social_icons/google.svg'
import microsoftIcon from '@proofzero/design-system/src/assets/social_icons/microsoft.svg'
import appleIcon from '@proofzero/design-system/src/atoms/providers/Apple'


import type { Addresses } from '@proofzero/platform.account/src/types'
import type { AddressURN } from '@proofzero/urns/address'
import type { DropdownSelectListItem } from '@proofzero/design-system/src/atoms/dropdown/DropdownSelectList'
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

const getEmailIcon = (
  type: OAuthAddressType | EmailAddressType | OptionType | CryptoAddressType
): JSX.Element | undefined => {
  return type === OAuthAddressType.Microsoft
    ? <img src={microsoftIcon} className="w-4 h-4 mr-3" />
    : type === OAuthAddressType.Apple
      ? <img src={appleIcon} className="w-4 h-4 mr-3" />
      : type === OAuthAddressType.Google
        ? <img src={googleIcon} className="w-4 h-4 mr-3" />
        : <HiOutlineEnvelope className="w-4 h-4 mr-3" />

}

export const modifyType = (string: string) => {
  if (string === CryptoAddressType.Wallet) {
    return "SC Wallet"
  }
  return string.charAt(0).toUpperCase() + string.slice(1)
}


export const getNormalisedConnectedEmails = (
  connectedAddresses?: Addresses | null
): Array<DropdownSelectListItem> => {
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
        icon: getEmailIcon(address.rc.addr_type as OAuthAddressType | EmailAddressType),
        title: address.qc.alias,
        value: address.baseUrn as AddressURN,
      }
    })
}

export const getNormalisedSmartContractWallets = (
  connectedAddresses?: GetAddressProfileResult[] | null
): DropdownSelectListItem[] => {
  if (!connectedAddresses) return []
  return connectedAddresses.map((address) => {
    return {
      title: address.title,
      value: address.id as AddressURN,
      subtitle: `${modifyType(address.type as string)} - ${address.address}`,
    }
  })
}
