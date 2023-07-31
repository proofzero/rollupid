import { z } from 'zod'
import {
  AuthorizationURN,
  AuthorizationURNSpace,
} from '@proofzero/urns/authorization'
import { AccountURN, AccountURNSpace } from '@proofzero/urns/account'
import { IdentityURN, IdentityURNSpace } from '@proofzero/urns/identity'
import { AnyURN, parseURN } from '@proofzero/urns'
import { EdgeURN } from '@proofzero/urns/edge'
import { CryptoAccountType } from '@proofzero/types/account'
import {
  IdentityGroupURN,
  IdentityGroupURNSpace,
} from '@proofzero/urns/identity-group'

export const NoInput = z.undefined()

export const AuthorizationURNInput = z.custom<AuthorizationURN>((input) => {
  if (typeof input !== 'string') {
    throw new Error(`AuthorizationURNInput is not a string: ${input}`)
  }
  const parsed = AuthorizationURNSpace.parse(input as AuthorizationURN)
  if (!AuthorizationURNSpace.is(`urn:rollupid:${parsed.nss}`)) {
    throw new Error(`invalid AuthorizationURN entry: ${input}`)
  }
  return input as AuthorizationURN
})

export const AccountURNInput = z.custom<AccountURN>((input) => {
  if (typeof input !== 'string') {
    throw new Error(`AccountURNInput is not a string: ${input}`)
  }
  const parsed = AccountURNSpace.parse(input as AccountURN)
  if (!AccountURNSpace.is(`urn:rollupid:${parsed.nss}`)) {
    throw new Error(`invalid AccountURN entry: ${input}`)
  }
  return input as AccountURN
})

export const IdentityURNInput = z.custom<IdentityURN>((input) => {
  if (!IdentityURNSpace.is(input as IdentityURN)) {
    throw new Error('Invalid IdentityURN entry')
  }
  return input as IdentityURN
})

export const IdentityGroupURNValidator = z.custom<IdentityGroupURN>((input) => {
  if (!IdentityGroupURNSpace.is(input as IdentityGroupURN)) {
    throw new Error('Invalid IdentityGroupURN entry')
  }
  return input as IdentityGroupURN
})

export const CryptoAccountTypeInput = z.custom<CryptoAccountType>((input) => {
  let addrType: CryptoAccountType
  switch (input) {
    case CryptoAccountType.ETH:
      addrType = CryptoAccountType.ETH
      break
    default:
      throw new TypeError(`invalid crypto account type: ${input}`)
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
  baseUrn: AnyURNInput.optional(),
  qc: z.record(z.string(), z.string().or(z.boolean()).optional()).optional(),
  rc: z.record(z.string(), z.string().or(z.boolean()).optional()).optional(),
})
