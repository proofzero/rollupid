// @kubelt/security:packages/security/scopes.ts

/**
 * Platform scope definitions and utilities.
 */

// Internal Types
// -----------------------------------------------------------------------------

type Scope = symbol

interface ScopeDescriptor {
  name: string
  description: string
}

interface ScopeMap {
  [scope: Scope]: ScopeDescriptor
}

// Exported Types
// -----------------------------------------------------------------------------

export type {
  Scope,
}

// Definitions
// -----------------------------------------------------------------------------

/**
 * The scope representing the ability to read profile data.
 *
 * @alpha
 */
export const SCOPE_PROFILE_READ: Scope = scope('scope.kubelt.com/profile/read')

/**
 * The scope representing the ability to write profile data.
 *
 * @alpha
 */
export const SCOPE_PROFILE_WRITE: Scope = scope('scope.kubelt.com/profile/write')

/**
 * The scope representing the ability to read account data.
 *
 * @alpha
 */
export const SCOPE_ACCOUNT_READ: Scope = scope('scope.kubelt.com/account/read')

/**
 * The scope representing the ability to write account data.
 *
 * @alpha
 */
export const SCOPE_ACCOUNT_WRITE: Scope = Symbol.for('scope.kubelt.com/account/write')

/**
 * All platform scopes with their descriptors.
 *
 * @alpha
 */
export const SCOPES: ScopeMap = {
  [SCOPE_PROFILE_READ]: {
    name: 'Public Profile',
    description: 'Read your profile data.',
  },
  [SCOPE_PROFILE_WRITE]: {
    name: 'Edit Profile',
    description: 'Write your profile data.',
  },
  [SCOPE_ACCOUNT_READ]: {
    name: 'Accounts',
    description: 'Read your connected accounts.',
  },
  [SCOPE_ACCOUNT_WRITE]: {
    name: 'Modify Accounts',
    description: 'Modify your connected accounts.',
  },
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
