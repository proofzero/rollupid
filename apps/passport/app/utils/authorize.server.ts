import { getAccountClient } from '~/platform.server'
import getNormalisedConnectedEmails from '@proofzero/utils/getNormalisedConnectedEmails'

import type { AccountURN } from '@proofzero/urns/account'
import type { PersonaData } from '@proofzero/types/application'
import type { EmailSelectListItem } from '@proofzero/utils/getNormalisedConnectedEmails'
import { UnauthorizedError } from '@proofzero/errors'

export type DataForScopes = {
  connectedEmails: EmailSelectListItem[]
  personaData: PersonaData
  effectiveScope: string[]
}

export function getSupersetFromArrays<T>(args: T[][]): T[] {
  const set = new Set([] as T[])
  args.forEach((arr) => arr.forEach((item: T) => set.add(item)))
  return Array.from(set)
}

// Deterministically sort scopes so that they are always in the same order
// when returned to the client. Email is always last.
// -----------------------------------------------------------------------------
const orderOfScopes: Record<string, number> = {
  openid: 0,
  profile: 1,
  email: 100,
}

export const reorderScope = (scopes: string[]): string[] => {
  return scopes.sort((a, b) => {
    const aIndex = orderOfScopes[a]
    const bIndex = orderOfScopes[b]
    if (aIndex === undefined) return 1
    if (bIndex === undefined) return -1
    return aIndex - bIndex
  })
}
// -----------------------------------------------------------------------------

export const getDataForScopes = async (
  urlScopes: string[],
  appScopes: string[],
  accountURN: AccountURN,
  jwt?: string,
  env?: any,
  traceSpan?: any
): Promise<DataForScopes> => {
  if (!accountURN)
    throw new UnauthorizedError({ message: 'Account URN is required' })

  const effectiveScope = reorderScope(
    getSupersetFromArrays([appScopes, urlScopes])
  )

  let connectedEmails: EmailSelectListItem[] = []
  const accountClient = getAccountClient(jwt || '', env, traceSpan)

  const connectedAccounts = await accountClient.getAddresses.query({
    account: accountURN,
  })
  if (connectedAccounts && connectedAccounts.length)
    connectedEmails = getNormalisedConnectedEmails(connectedAccounts)

  const personaData: PersonaData = {}

  return {
    connectedEmails,
    personaData,
    effectiveScope: Array.from(effectiveScope),
  }
}
