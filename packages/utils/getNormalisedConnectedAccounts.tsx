import React from 'react'

import {
  NodeType,
  OAuthAccountType,
  EmailAccountType,
  CryptoAccountType,
  WebauthnAccountType,
} from '@proofzero/types/account'

import { HiOutlineEnvelope } from 'react-icons/hi2'

import googleIcon from '@proofzero/design-system/src/atoms/providers/Google'
import microsoftIcon from '@proofzero/design-system/src/atoms/providers/Microsoft'
import appleIcon from '@proofzero/design-system/src/atoms/providers/Apple'

import type { Accounts } from '@proofzero/platform.identity/src/types'
import type { AccountURN } from '@proofzero/urns/account'
import type { DropdownSelectListItem } from '@proofzero/design-system/src/atoms/dropdown/DropdownSelectList'
import type { GetAccountProfileResult } from '@proofzero/platform.account/src/jsonrpc/methods/getAccountProfile'

export enum OptionType {
  AddNew,
  None,
}

export type EmailSelectListItem = {
  email: string
  type: OAuthAccountType | EmailAccountType | OptionType
  accountURN?: AccountURN
}

export type SCWalletSelectListItem = {
  title: string
  type: CryptoAccountType | OptionType
  accountURN: AccountURN
  cryptoAccount?: string
}

export const getEmailIcon = (type: string): JSX.Element => {
  return type === OAuthAccountType.Microsoft ? (
    <img src={microsoftIcon} className="w-4 h-4 mr-3" />
  ) : type === OAuthAccountType.Apple ? (
    <img src={appleIcon} className="w-4 h-4 mr-3" />
  ) : type === OAuthAccountType.Google ? (
    <img src={googleIcon} className="w-4 h-4 mr-3" />
  ) : (
    <HiOutlineEnvelope className="w-4 h-4 mr-3" />
  )
}

export const adjustAccountTypeToDisplay = (
  accountType: OAuthAccountType | EmailAccountType | CryptoAccountType | WebauthnAccountType
) => {
  if (accountType === CryptoAccountType.Wallet) {
    return 'SC Wallet'
  }
  return accountType.charAt(0).toUpperCase() + accountType.slice(1)
}

export const getEmailDropdownItems = (
  connectedAccounts?: Accounts | null
): Array<DropdownSelectListItem> => {
  if (!connectedAccounts) return []

  const filteredEmailsFromConnectedAccounts = connectedAccounts.filter(
    (account) => {
      return (
        (account.rc.node_type === NodeType.OAuth &&
          (account.rc.addr_type === OAuthAccountType.Google ||
            account.rc.addr_type === OAuthAccountType.Microsoft ||
            account.rc.addr_type === OAuthAccountType.Apple)) ||
        (account.rc.node_type === NodeType.Email &&
          account.rc.addr_type === EmailAccountType.Email)
      )
    }
  )

  return filteredEmailsFromConnectedAccounts.map((account, i) => {
    return {
      // There's a problem when passing icon down to client (since icon is a JSX.Element)
      // My guess is that it should be rendered on the client side only.
      // that's why I'm passing type (as subtitle) instead of icon and then substitute it
      // with icon on the client side
      subtitle: account.rc.addr_type as
        | OAuthAccountType
        | EmailAccountType
        | CryptoAccountType,
      title: account.qc.alias,
      value: account.baseUrn as AccountURN,
    }
  })
}

//accountDropdownItems
export const getAccountDropdownItems = (
  accountProfiles?: Array<GetAccountProfileResult> | null
): Array<DropdownSelectListItem> => {
  if (!accountProfiles) return []
  return accountProfiles.map((account) => {
    return {
      title: account.title,
      value: account.id as AccountURN,
      subtitle: `${adjustAccountTypeToDisplay(account.type)} - ${account.address
        }`,
    }
  })
}
