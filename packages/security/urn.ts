// @kubelt/security:packages/security/urn.ts

import psl from 'psl'
/**
 * Platform scope definitions and utilities.
 */

// Internal Types
// -----------------------------------------------------------------------------

// Exported Types
// -----------------------------------------------------------------------------

export type ID_DESCRIPTOR = 'id'
export type NAME_DESCRIPTOR = 'name'
export type DESCRIPTOR = ID_DESCRIPTOR | NAME_DESCRIPTOR

// Definitions
// -----------------------------------------------------------------------------

// object://<service>.<domain>/<do>/?<descriptor>=<value>

export const DEFAULT_DOMAIN = 'threeid.xyz'

// generateUrn()
// -----------------------------------------------------------------------------

export function generateUrn(
  service: string,
  domain: string,
  object: string,
  descriptor: DESCRIPTOR,
  value: string
): string {
  return `object://${service}.${domain}/${object}/?${descriptor}=${value}`
}

// parseUrn()
// -----------------------------------------------------------------------------

export function parseUrn(urn: string): {
  service: string
  domain: string
  object: string
  descriptor: string
  value: string
} {
  const url = new URL(urn.replace('object://', 'https://'))
  const parsed = psl.parse(urn)
  if (!parsed) {
    throw new Error('Invalid URN')
  }
  const { subdomain: service, domain } = parsed as psl.ParsedDomain
  if (!service || !domain) {
    throw new Error('Invalid URN')
  }
  const object = url.pathname.replace('/', '')
  const [descriptor, value] = url.search.replace('?', '').split('=')
  return { service, domain, object, descriptor, value }
}
