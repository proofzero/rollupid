import {
  NodeType,
  OAuthAddressType,
  EmailAddressType,
} from '@proofzero/types/address'

import type { Addresses } from '@proofzero/platform.account/src/types'
import { AddressURN } from '@proofzero/urns/address'

export type EmailSelectListItem = {
  email: string
  addressURN: AddressURN
  type?: OAuthAddressType | EmailAddressType
}

export default function (connectedAddresses: Addresses): EmailSelectListItem[] {
  return connectedAddresses
    .filter((address) => {
      return (
        (address.rc.node_type === NodeType.OAuth &&
          (address.rc.addr_type === OAuthAddressType.Google ||
            address.rc.addr_type === OAuthAddressType.Microsoft)) ||
        (address.rc.node_type === NodeType.Email &&
          address.rc.addr_type === EmailAddressType.Email)
      )
    })
    .map((address) => {
      if (address.rc.node_type === NodeType.OAuth) {
        if (address.rc.addr_type === OAuthAddressType.Google)
          return {
            type: OAuthAddressType.Google,
            email: address.qc.alias,
            addressURN: address.baseUrn as AddressURN,
          }
        if (address.rc.addr_type === OAuthAddressType.Microsoft)
          return {
            type: OAuthAddressType.Microsoft,
            email: address.qc.alias,
            addressURN: address.baseUrn as AddressURN,
          }
      }

      return {
        type: EmailAddressType.Email,
        email: address.qc.alias,
        addressURN: address.baseUrn as AddressURN,
      }
    })
}
