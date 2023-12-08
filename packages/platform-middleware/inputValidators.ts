import { z } from 'zod'
import {
  AuthorizationURN,
  AuthorizationURNSpace,
} from '@proofzero/urns/authorization'
import { AccountURN, AccountURNSpace } from '@proofzero/urns/account'
import { IdentityURN, IdentityURNSpace } from '@proofzero/urns/identity'
import { IdentityRefURN } from '@proofzero/urns/identity-ref'
import { AnyURN, parseURN } from '@proofzero/urns'
import { EdgeURN } from '@proofzero/urns/edge'
import {
  CryptoAccountType,
  EmailAccountType,
  OAuthAccountType,
  WebauthnAccountType,
} from '@proofzero/types/account'
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

export const EmailAccountTypeInput = z.custom<EmailAccountType>((input) => {
  switch (input) {
    case EmailAccountType.Email:
    case EmailAccountType.Mask:
      break
    default:
      throw new TypeError(`invalid email account type: ${input}`)
  }
  return input as EmailAccountType
})

export const OAuthAccountTypeInput = z.custom<OAuthAccountType>((input) => {
  switch (input) {
    case OAuthAccountType.Apple:
    case OAuthAccountType.Discord:
    case OAuthAccountType.GitHub:
    case OAuthAccountType.Google:
    case OAuthAccountType.Microsoft:
    case OAuthAccountType.Twitter:
      break
    default:
      throw new TypeError(`invalid oauth account type: ${input}`)
  }
  return input as OAuthAccountType
})

export const WebauthnAccountTypeInput = z.custom<WebauthnAccountType>(
  (input) => {
    switch (input) {
      case WebauthnAccountType.WebAuthN:
        break
      default:
        throw new TypeError(`invalid webauthn account type: ${input}`)
    }
    return input as WebauthnAccountType
  }
)

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

export const IdentityRefURNValidator = z.custom<IdentityRefURN>((input) => {
  if (
    !IdentityURNSpace.is(input as IdentityURN) &&
    !IdentityGroupURNSpace.is(input as IdentityGroupURN)
  ) {
    throw new Error('Invalid IdentityRefURN entry')
  }

  return input as IdentityRefURN
})
