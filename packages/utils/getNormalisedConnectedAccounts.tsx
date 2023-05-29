import React from "react"

import {
  NodeType,
  OAuthAddressType,
  EmailAddressType,
  CryptoAddressType,
} from '@proofzero/types/address'

import { HiOutlineEnvelope } from 'react-icons/hi2'

import googleIcon from '@proofzero/design-system/src/atoms/providers/Google'
import microsoftIcon from '@proofzero/design-system/src/atoms/providers/Microsoft'
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

export const getEmailIcon = (
  type: string
): JSX.Element => {
  return type === OAuthAddressType.Microsoft
    ? <img src={microsoftIcon} className="w-4 h-4 mr-3" />
    : type === OAuthAddressType.Apple
      ? <img src={appleIcon} className="w-4 h-4 mr-3" />
      : type === OAuthAddressType.Google
        ? <img src={googleIcon} className="w-4 h-4 mr-3" />
        : <HiOutlineEnvelope className="w-4 h-4 mr-3" />

}

export const adjustTypeToDisplay = (string: string) => {
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
        // There's a problem when passing icon down to client (since icon is a JSX.Element)
        // My guess is that it should be rendered on the client side only.
        // that's why I'm passing type (as subtitle) instead of icon and then substitute it
        // with icon on the client side
        subtitle: address.rc.addr_type as OAuthAddressType | EmailAddressType | CryptoAddressType,
        title: address.qc.alias,
        value: address.baseUrn as AddressURN,
      }
    })
}

export const getNormalisedAddressProfiles = (
  addressProfiles?: Array<GetAddressProfileResult> | null
) => {
  if (!addressProfiles) return []
  return addressProfiles
    .map((address) => {
      return {
        title: address.title,
        value: address.id as AddressURN,
        subtitle: `${adjustTypeToDisplay(address.type as string)} - ${address.address}`,
      }
    })
}