// @proofzero/security:packages/security/index.ts

/**
 * Platform security definitions and utilities.
 */

// Scopes
// -----------------------------------------------------------------------------

import {
  ALL_SCOPES,
  SCOPES,
  SCOPE_ACCOUNT_READ,
  SCOPE_ACCOUNT_WRITE,
  SCOPE_PROFILE_READ,
  SCOPE_PROFILE_WRITE,
  Scope,
  scope,
} from './scopes'

// API
// -----------------------------------------------------------------------------

export type { Scope }

export { scope }
