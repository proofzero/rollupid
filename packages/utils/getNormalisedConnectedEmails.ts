import googleIcon from '@proofzero/design-system/src/assets/social_icons/google.svg'
import microsoftIcon from '@proofzero/design-system/src/assets/social_icons/microsoft.svg'

import {
  NodeType,
  OAuthAddressType,
  EmailAddressType,
} from '@proofzero/types/address'
import type { Addresses } from '@proofzero/platform.account/src/types'

export default function (connectedAddresses: Addresses) {
  return connectedAddresses
    .filter((address) => {
      console.log(address.rc.addr_type, address.rc.node_type, {
        google: OAuthAddressType.Google,
        mcrsft: OAuthAddressType.Microsoft,
        nodeType: NodeType.OAuth,
      })
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
        if (address.rc.addr_type === OAuthAddressType.Google) {
          return { iconURL: googleIcon, email: address.qc.alias }
        }
        if (address.rc.addr_type === OAuthAddressType.Microsoft)
          return { iconURL: microsoftIcon, email: address.qc.alias }
      } else {
        return { email: address.qc.alias }
      }
    })
}
