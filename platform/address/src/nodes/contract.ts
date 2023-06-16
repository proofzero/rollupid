import { DurableObjectStubProxy } from 'do-proxy'

import { InternalServerError } from '@proofzero/errors'
import { CryptoAddressType } from '@proofzero/types/address'
import ENSUtils from '@proofzero/platform-clients/ens-utils'

import { AddressNode } from '.'
import { AddressProfile } from '../types'

type CryptoAddressProfile = AddressProfile<CryptoAddressType.Wallet>

export default class ContractAddress {
  declare node: AddressNode

  constructor(node: AddressNode) {
    this.node = node
  }

  async getProfile(): Promise<CryptoAddressProfile> {
    const [nickname, gradient, address] = await Promise.all([
      this.node.class.getNickname(),
      this.node.class.getGradient(),
      this.node.class.getAddress(),
    ])

    if (!address)
      throw new InternalServerError({ message: 'address not found' })

    const profile = (await getCryptoAddressProfile(
      address
    )) as CryptoAddressProfile
    profile.icon = profile.icon || gradient

    if (nickname) {
      profile.title = nickname
    }

    profile.title = profile.title || address

    return profile
  }
}

const getCryptoAddressProfile = async (address: string) => {
  return {
    address: address,
    type: CryptoAddressType.Wallet,
  }
}

export type ContractAddressProxyStub = DurableObjectStubProxy<ContractAddress>
