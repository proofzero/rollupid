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
export const SCOPE_PROFILE_READ: Scope = Symbol.for('profile.read')

/**
 * The scope representing the ability to write profile data.
 *
 * @alpha
 */
export const SCOPE_PROFILE_WRITE: Scope = Symbol.for('profile.write')

/**
 * The scope representing the ability to read account data.
 *
 * @alpha
 */
export const SCOPE_ACCOUNT_READ: Scope = Symbol.for('account.read')

/**
 * The scope representing the ability to write account data.
 *
 * @alpha
 */
export const SCOPE_ACCOUNT_WRITE: Scope = Symbol.for('account.write')

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
