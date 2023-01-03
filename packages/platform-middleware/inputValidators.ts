import { z } from 'zod'
import { AddressURN, AddressURNSpace } from '@kubelt/urns/address'
import { AccountURN, AccountURNSpace } from '@kubelt/urns/account'
import { Address } from '@kubelt/types'

export const AddressURNInput = z.custom<AddressURN>((input) => {
  if (AddressURNSpace.parse(input as AddressURN) === null) {
    throw new Error('Invalid AddressURN entry')
  }
  return input as AddressURN
})

export const AccountURNInput = z.custom<AccountURN>((input) => {
  if (AccountURNSpace.parse(input as AccountURN) === null) {
    throw new Error('Invalid AccountURN entry')
  }
  return input as AccountURN
})

export const CryptoAddressTypeInput = z.custom<Address.CryptoAddressType>(
  (input) => {
    let addrType: Address.CryptoAddressType
    switch (input) {
      case Address.CryptoAddressType.Ethereum:
        addrType = Address.CryptoAddressType.Ethereum
        break
      case Address.CryptoAddressType.ETH:
        addrType = Address.CryptoAddressType.ETH
        break
      default:
        throw new TypeError(`invalid crypto address type: ${input}`)
    }

    return addrType
  }
)
