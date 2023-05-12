// @proofzero/security:packages/security/scopes.ts

/**
 * Platform scope definitions and utilities.
 */

// Internal Types
// -----------------------------------------------------------------------------

type Scope = symbol

import { z } from 'zod'

export const ScopeSchema = z.object({
  name: z.string(),
  description: z.string(),
  class: z.string(),
  devDescription: z.string().optional(),
  /**
   * Some scopes are hidden from the user and are only used internally
   */
  hidden: z.boolean().optional(),
  experimental: z.boolean().optional(),
})

export const ScopeMeta = z.record(z.string(), ScopeSchema)

export type ScopeMeta = z.infer<typeof ScopeMeta>
export type ScopeDescriptor = z.infer<typeof ScopeSchema>

interface ScopeMap {
  [scope: Scope]: ScopeDescriptor
}

// Exported Types
// -----------------------------------------------------------------------------

export type { Scope }

// Definitions
// -----------------------------------------------------------------------------

// RESTRICTED

/**
 * The scope representing the admin permissions for an account.
 *
 * @alpha
 */
export const SCOPE_ADMIM: Scope = scope('scope://rollup.id/admin.admin')

export const SCOPE_CONNECTED_ACCOUNTS: Scope = scope('connected_accounts')

//Standard OIDC email claim
export const SCOPE_EMAIL: Scope = scope('email')
export const SCOPE_PROFILE: Scope = scope('profile')
export const SCOPE_OPENID: Scope = scope('openid')

/**
 * The scope required to read account object.
 */
export const SCOPE_ACCOUNT_READ: Scope = scope('scope://rollup.id/account#read')

/**
 * The scope required to use smart contract wallet object.
 */
export const SCOPE_SMART_CONTRACT_WALLETS: Scope = scope('erc_4337')

/**
 * The scope required to write to account object.
 */
export const SCOPE_ACCOUNT_WRITE: Scope = scope(
  'scope://rollup.id/account#read'
)

/**
 * The scope representing the ability to read profile data.
 *
 * @alpha
 */
export const SCOPE_PROFILE_READ: Scope = scope('scope://rollup.id/profile#read')

/**
 * The scope representing the ability to write profile data.
 *
 * @alpha
 */
export const SCOPE_PROFILE_WRITE: Scope = scope(
  'scope://rollup.id/profile#write'
)

/**
 * The scope representing the ability to read visible connected blockchain accounts.
 *
 * @alpha
 */
export const SCOPE_CONNECTED_ACCOUNTS_READ: Scope = scope(
  'scope://rollup.id/connected-accounts#read'
)

// SPECIALIZED SCOPES

/**
 * The scope representing the ability to manage and create a specific dedicated account.
 *
 * @alpha
 */
export const SCOPE_BLOCKCHAIN_ACCOUNT_MANAGE: Scope = scope(
  'scope://rollup.id/blockchain-account/{{ idref }}#manage'
)

/**
 * The scope representing the ability to transact using a specific dedicated account.
 *
 * @alpha
 */
export const SCOPE_BLOCKCHAIN_ACCOUNT_TRANSACT: Scope = scope(
  'scope://rollup.id/blockchain-account/transact/{{ idref }}#write'
)

/**
 * All platform scopes with their descriptors.
 *
 * @alpha
 */
export const SCOPES: ScopeMap = {
  [SCOPE_OPENID]: {
    name: 'OpenID',
    description: 'Read your OpenID profile',
    devDescription:
      'Standard scope value indicating the authorization request to be an OIDC request. This provides an ID token as part of the token exchange.',
    class: 'implied',
    hidden: true,
  },
  [SCOPE_EMAIL]: {
    name: 'Email',
    description: 'Read your chosen email address',
    devDescription:
      'Standard scope value indicating that configured email address will be included in the ID token as well as the /userinfo endpoint response.',
    class: 'address',
  },
  [SCOPE_PROFILE]: {
    name: 'Profile',
    description: `Read your name and picture`,
    devDescription: 'This scope currently provides name and picture claims.',
    class: 'profile',
  },
  [SCOPE_CONNECTED_ACCOUNTS]: {
    name: 'Connected accounts',
    description: `List your connected accounts and identifiers`,
    devDescription:
      'Scope value that indicates that the type and address of each connected account will be included in the ID token as well as the /userinfo endpoint response.',
    class: 'address',
  },
  [SCOPE_SMART_CONTRACT_WALLETS]: {
    name: 'Smart contract wallets',
    description: `Read your smart contract addresses and make transactions on them on your behalf`,
    devDescription:
      'Scope value indicating that a configured smart contract wallets will be included in the ID token as well as the /userinfo endpoint response.',
    class: 'address',
    experimental: true,
  },
  // NOT READY YET
  // [SCOPE_PROFILE_READ]: {
  //   name: 'Public Profile',
  //   description: 'Read your profile data.',
  //   class: 'account',
  // },
  // [SCOPE_PROFILE_WRITE]: {
  //   name: 'Edit Profile',
  //   description: 'Write your profile data.',
  //   class: 'account',
  // },
  // [SCOPE_CONNECTED_ACCOUNTS_READ]: {
  //   name: 'Connected Accounts',
  //   description: 'Read your visible connected blockchain accounts.',
  //   class: 'address',
  // },
  // [SCOPE_BLOCKCHAIN_ACCOUNT_MANAGE]: {
  //   name: 'Create Dedicated Blockchain Account',
  //   description:
  //     'Create and manage a dedicated blockchain account isolated for this application.',
  // },
  // [SCOPE_BLOCKCHAIN_ACCOUNT_TRANSACT]: {
  //   name: 'Transact with Dedicated Blockchain Account',
  //   description:
  //     'Ability to transact on your behalf for a specific dedicated blockchain account.',
  // },
}

/**
 * A set of all platform scopes.
 *
 * @alpha
 */
export const ALL_SCOPES = new Set(Object.keys(SCOPES))

/**
 * Convert symbol keys to their string descriptions since
 * JSON.stringify doesn't do symbols.
 */
export const SCOPES_JSON: Record<string, ScopeDescriptor> =
  Object.getOwnPropertySymbols(SCOPES).reduce((a, k) => {
    const acc: Record<string, ScopeDescriptor> = a
    const scope: Scope = k
    const key: string = asString(scope)
    acc[key] = SCOPES[scope]
    return a
  }, {})

// scope()
// -----------------------------------------------------------------------------

/**
 * Construct a scope from a URI (provided as a string).
 *
 * @param uri - The URI that defines the scope
 * @returns a new Scope
 * @alpha
 */
export function scope(uri: string): Scope {
  // Throws if the URI is invalid.
  decodeURI(uri)
  return Symbol.for(uri)
}

// asString()
// -----------------------------------------------------------------------------

/**
 * Return the string representation of a scope.
 *
 * @param scope - a Scope
 * @returns the scope URI as a string
 * @alpha
 */
export function asString(scope: Scope): string {
  if (scope.description !== undefined) {
    return scope.description
  }
  throw new Error(`invalid scope; missing description`)
}
