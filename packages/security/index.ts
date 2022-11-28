// @kubelt/security:packages/security/index.ts

/**
 * Platform security definitions and utilities.
 */

// Scopes
// -----------------------------------------------------------------------------

import type { Scope } from './scopes'

export type { Scope }

import {
  ALL_SCOPES,
  SCOPES,
  SCOPE_ACCOUNT_READ,
  SCOPE_ACCOUNT_WRITE,
  SCOPE_PROFILE_READ,
  SCOPE_PROFILE_WRITE,
} from './scopes'
