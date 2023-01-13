import { z } from 'zod'
import { AccessURN, AccessURNSpace } from '@kubelt/urns/access'
import { AddressURN, AddressURNSpace } from '@kubelt/urns/address'
import { AccountURN, AccountURNSpace } from '@kubelt/urns/account'
import { AnyURN, parseURN } from '@kubelt/urns'
import { EdgeURN } from '@kubelt/urns/edge'
import { CryptoAddressType } from '@kubelt/types/address'

export const NoInput = z.undefined()

export const AccessURNInput = z.custom<AccessURN>((input) => {
  if (typeof input !== 'string') {
    throw new Error(`input is not a string: ${input}`)
  }
  const parsed = AccessURNSpace.parse(input as AccessURN)
  if (!AccessURNSpace.is(`urn:threeid:${parsed.nss}`)) {
    throw new Error(`invalid AccessURN entry: ${input}`)
  }
  return input as AccessURN
})

export const AddressURNInput = z.custom<AddressURN>((input) => {
  if (typeof input !== 'string') {
    throw new Error(`input is not a string: ${input}`)
  }
  const parsed = AddressURNSpace.parse(input as AddressURN)
  if (!AddressURNSpace.is(`urn:threeid:${parsed.nss}`)) {
    throw new Error(`invalid AddressURN entry: ${input}`)
  }
  return input as AddressURN
})

export const AccountURNInput = z.custom<AccountURN>((input) => {
  if (AccountURNSpace.parse(input as AccountURN) === null) {
    throw new Error('Invalid AccountURN entry')
  }
  return input as AccountURN
})

export const CryptoAddressTypeInput = z.custom<CryptoAddressType>((input) => {
  let addrType: CryptoAddressType
  switch (input) {
    case CryptoAddressType.Ethereum:
      addrType = CryptoAddressType.Ethereum
      break
    case CryptoAddressType.ETH:
      addrType = CryptoAddressType.ETH
      break
    default:
      throw new TypeError(`invalid crypto address type: ${input}`)
  }

  return addrType
})

export const AnyURNInput = z.custom<AnyURN>((input) => {
  parseURN(input as string)
  return input as AnyURN
})

export const EdgeTagInput = z.custom<EdgeURN>((input) => {
  parseURN(input as string)
  return input as EdgeURN
})

export const EdgeDirectionInput = z.enum(['incoming', 'outgoing'])

export const NodeFilterInput = z.object({
  id: AnyURNInput.optional(),
  fr: z.string().optional(),
  qc: z.record(z.string(), z.string().optional()).optional(),
  rc: z.record(z.string(), z.string().optional()).optional(),
})
