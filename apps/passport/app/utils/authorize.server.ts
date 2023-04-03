import { getAccountClient } from '~/platform.server'
import getNormalisedConnectedEmails from '@proofzero/utils/getNormalisedConnectedEmails'

import type { AccountURN } from '@proofzero/urns/account'
import type { PersonaData } from '@proofzero/types/application'
import type { EmailSelectListItem } from '@proofzero/utils/getNormalisedConnectedEmails'
import { UnauthorizedError } from '@proofzero/errors'

export type DataForScopes = {
  connectedEmails: EmailSelectListItem[]
  personaData: PersonaData
  superScopes: string[]
}

export function getSupersetFromArrays<T>(args: T[][]): T[] {
  const set = new Set([] as T[])
  args.forEach((arr) => arr.forEach((item: T) => set.add(item)))
  return Array.from(set)
}

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

  const superScopes = getSupersetFromArrays([appScopes, urlScopes])

  let connectedEmails: EmailSelectListItem[] = []
  const accountClient = getAccountClient(jwt || '', env, traceSpan)
  if (superScopes.includes('email')) {
    const indexOfTypeEmail = superScopes.indexOf('email')

    // swap it with the last element and put last element in the index of email
    superScopes[indexOfTypeEmail] = superScopes[superScopes.length - 1]
    superScopes[superScopes.length - 1] = 'email'

    const connectedAccounts = await accountClient.getAddresses.query({
      account: accountURN,
    })
    if (connectedAccounts && connectedAccounts.length)
      connectedEmails = getNormalisedConnectedEmails(connectedAccounts)
  }

  const personaData: PersonaData = {}

  return {
    connectedEmails,
    personaData,
    superScopes: Array.from(superScopes),
  }
}
