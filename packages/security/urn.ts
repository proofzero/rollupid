// @kubelt/security:packages/security/urn.ts

import psl from 'psl'
/**
 * Platform scope definitions and utilities.
 */

// Internal Types
// -----------------------------------------------------------------------------

// Exported Types
// -----------------------------------------------------------------------------

export type URN = {
  service: string
  domain: string
  object: string
  descriptors: Partial<Record<DESCRIPTORS, string>>
}

// Definitions
// -----------------------------------------------------------------------------

// object://<service>.<domain>/<do>/?<descriptor>=<value>

export const DEFAULT_DOMAIN = 'threeid.xyz'

export enum DESCRIPTOR {
  NAME = 'name',
  TYPE = 'type',
}
export type DESCRIPTORS = {
  [key: string]: string
} & DESCRIPTOR

// generateUrn()
// -----------------------------------------------------------------------------

export function generateUrn(
  service: string,
  domain: string,
  object: string,
  descriptors: Partial<Record<DESCRIPTORS, string>>
): string {
  const queryParams = new URLSearchParams(descriptors)
  return `object://${service}.${domain}/${object}/?${queryParams}`
}

// parseUrn()
// -----------------------------------------------------------------------------

export function parseUrn(urn: string): URN {
  const url = new URL(urn.replace('object://', 'https://'))
  const parsed = psl.parse(url.hostname)
  if (!parsed) {
    throw new Error('Invalid 3RN')
  }
  const { subdomain: service, domain } = parsed as psl.ParsedDomain
  if (!service || !domain) {
    throw new Error('Invalid 3RN')
  }
  if (!url.searchParams.get(DESCRIPTOR.TYPE)) {
    throw new Error('3RN missing type descriptor')
  }
  if (!url.searchParams.get(DESCRIPTOR.NAME)) {
    throw new Error('3RN missing name descriptor')
  }

  const object = url.pathname.replace(new RegExp('/', 'g'), '')
  return {
    service,
    domain,
    object,
    descriptors: Object.fromEntries(url.searchParams),
  }
}
