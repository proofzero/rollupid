import { z } from 'zod'
import { AddressURN, AddressURNSpace } from '@kubelt/urns/address'
import { AccountURN, AccountURNSpace } from '@kubelt/urns/account'
import { Address } from '@kubelt/types'
import { AnyURN, parseURN } from '@kubelt/urns'
import { EdgeTag } from '@kubelt/graph'

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

export const AnyURN = z.custom<AnyURN>((input) => {
  parseURN(input as string)
  return input as AnyURN
})

export const EdgeTag = z.custom<EdgeTag>((input) => {
  parseURN(input as string)
  return input as EdgeTag
})

export const EdgeDirectionInput = z.enum(['incoming', 'outgoing'])

export const NodeFilterInput = z.object({
  id: AnyURN.optional(),
  fr: z.string().optional(),
  qc: z.record(z.string(), z.string()).optional(),
  rc: z.record(z.string(), z.string()).optional(),
})
