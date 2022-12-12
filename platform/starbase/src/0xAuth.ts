// @kubelt/platform.starbase:src/oauth.ts

/**
 * Utilities for generating an OAuth profile.
 */

import { hexlify } from '@ethersproject/bytes'

// Constants
// -----------------------------------------------------------------------------

const SECRET_LENGTH_BYTES = 20

const ID_LENGTH_BYTES = 16

// makeClientId()
// -----------------------------------------------------------------------------

/**
 *
 */
export function makeClientId() {
  const idBuffer = new Uint8Array(ID_LENGTH_BYTES)
  const idData = crypto.getRandomValues(idBuffer)
  // Strip off "0x" prefix.
  const id = hexlify(idData).slice(2)

  return id
}

// makeClientSecret()
// -----------------------------------------------------------------------------

/**
 *
 */
export function makeClientSecret() {
  const secBuffer = new Uint8Array(SECRET_LENGTH_BYTES)
  const secData = crypto.getRandomValues(secBuffer)
  // Strip off "0x" prefix.
  const secret = hexlify(secData).slice(2)

  return `secret:${secret}`
}
