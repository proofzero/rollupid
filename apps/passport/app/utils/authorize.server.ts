import { getAccountClient, getAddressClient } from '~/platform.server'
import getNormalisedConnectedEmails from '@proofzero/utils/getNormalisedConnectedEmails'

import type { AccountURN } from '@proofzero/urns/account'
import type { PersonaData } from '@proofzero/types/application'
import type { EmailSelectListItem } from '@proofzero/utils/getNormalisedConnectedEmails'
import { UnauthorizedError } from '@proofzero/errors'
import { createConsoleParamsSession } from '~/session.server'

import { GetAddressProfileResult } from '@proofzero/platform.address/src/jsonrpc/methods/getAddressProfile'

export type DataForScopes = {
  connectedEmails: EmailSelectListItem[]
  personaData: PersonaData
  requestedScope: string[]
  connectedAccounts: GetAddressProfileResult[]
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
  requestedScope: string[],
  accountURN: AccountURN,
  jwt?: string,
  env?: any,
  traceSpan?: any
): Promise<DataForScopes> => {
  if (!accountURN)
    throw new UnauthorizedError({ message: 'Account URN is required' })

  let connectedEmails: EmailSelectListItem[] = []
  let connectedAddresses: GetAddressProfileResult[] = []

  const accountClient = getAccountClient(jwt || '', env, traceSpan)

  const connectedAccounts = await accountClient.getAddresses.query({
    account: accountURN,
  })
  if (connectedAccounts && connectedAccounts.length) {
    connectedEmails = getNormalisedConnectedEmails(connectedAccounts)
    connectedAddresses = await Promise.all(
      connectedAccounts.map((ca) => {
        const addressClient = getAddressClient(ca.baseUrn, env, traceSpan)
        return addressClient.getAddressProfile.query()
      })
    )
  }

  const personaData: PersonaData = {}

  return {
    connectedEmails,
    personaData,
    requestedScope: reorderScope(requestedScope),
    connectedAccounts: connectedAddresses,
  }
}

/** Creates an authorization cookie, capturing current authz query params,
 * and redirects to the authentication route
 */
export async function createAuthzParamCookieAndAuthenticate(
  request: Request,
  authzParams: ConsoleParams,
  env: Env
) {
  const qp = new URLSearchParams()

  const url = new URL(request.url)
  if (url.searchParams.has('login_hint')) {
    qp.append('login_hint', url.searchParams.get('login_hint')!)
  }

  throw await createConsoleParamsSession(authzParams, env, qp)
}

/** Checks whether the authorization cookie parameters match with
 * authorization query parameters. Only the "standard" params get
 * checked.
 */
export function authzParamsMatch(
  authzCookieParams: ConsoleParams,
  authzQueryParams: ConsoleParams
) {
  const scopesMatch = !!(
    authzCookieParams &&
    authzCookieParams.scope &&
    authzQueryParams &&
    authzQueryParams.scope &&
    authzCookieParams.scope.length === authzQueryParams.scope.length &&
    authzQueryParams.scope.every((e) => authzCookieParams.scope!.includes(e))
  )
  const authzReqRedirectURL = authzQueryParams.redirectUri
    ? new URL(authzQueryParams.redirectUri)
    : undefined
  const authzReqCookieRedirectURL = authzCookieParams.redirectUri
    ? new URL(authzCookieParams.redirectUri)
    : undefined

  return (
    scopesMatch &&
    authzCookieParams.clientId === authzQueryParams.clientId &&
    `${authzReqRedirectURL?.origin}${authzReqRedirectURL?.pathname}` ===
      `${authzReqCookieRedirectURL?.origin}${authzReqCookieRedirectURL?.pathname}` &&
    authzCookieParams.state === authzQueryParams.state
  )
}
