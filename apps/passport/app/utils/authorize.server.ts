import { getAccountClient } from '~/platform.server'
import getNormalisedConnectedEmails from '@proofzero/utils/getNormalisedConnectedEmails'

import type { AccountURN } from '@proofzero/urns/account'
import type { ScopeDescriptor } from '@proofzero/security/scopes'
import type { PersonaData } from '@proofzero/types/application'
import type { EmailSelectListItem } from '@proofzero/utils/getNormalisedConnectedEmails'

export const getDataForScopes = async (
  scopeLookUpTable: Record<string, ScopeDescriptor>,
  urlScopes: string[] | null,
  appScopes: string[],
  accountURN: AccountURN,
  jwt?: string,
  env?: any,
  traceSpan?: any
) => {
  if (!accountURN) return

  const scopesFromApp = appScopes.filter(
    (scope) => !scopeLookUpTable[scope].hidden
  )
  const scopesFromUrl =
    urlScopes?.filter((scope) => !scopeLookUpTable[scope].hidden) || []

  const unitedScopes = new Set([...scopesFromApp, ...scopesFromUrl])

  let connectedEmails: EmailSelectListItem[] = []
  const accountClient = getAccountClient(jwt || '', env, traceSpan)
  if (unitedScopes.has('email')) {
    const connectedAccounts = await accountClient.getAddresses.query({
      account: accountURN,
    })
    if (connectedAccounts && connectedAccounts.length)
      connectedEmails = getNormalisedConnectedEmails(connectedAccounts)
  }

  const personaData: PersonaData = {}

  if (connectedEmails.length) personaData.email = connectedEmails[0].email

  return {
    connectedEmails,
    personaData,
    unitedScopes: Array.from(unitedScopes),
  }
}
