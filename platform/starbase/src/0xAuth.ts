// @kubelt/platform.starbase:src/oauth.ts

/**
 * Utilities for generating an OAuth profile.
 */

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
  const id = [...crypto.getRandomValues(new Uint8Array(ID_LENGTH_BYTES))]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  return id
}

// makeClientSecret()
// -----------------------------------------------------------------------------

/**
 *
 */
export function makeClientSecret() {
  const secret = [
    ...crypto.getRandomValues(new Uint8Array(SECRET_LENGTH_BYTES)),
  ]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  return secret
}
