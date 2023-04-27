import { getAccountClient, getAddressClient } from '~/platform.server'
import {
  getNormalisedConnectedEmails,
  getNormalisedSmartContractWallets,
} from '@proofzero/utils/getNormalisedConnectedAccounts'

import { BadRequestError, UnauthorizedError } from '@proofzero/errors'
import {
  createAuthorizationParamsCookieAndAuthenticate,
  createAuthorizationParamsCookieHeaders,
} from '~/session.server'

import type { GetAddressProfileResult } from '@proofzero/platform.address/src/jsonrpc/methods/getAddressProfile'

import {
  SCOPE_CONNECTED_ACCOUNTS,
  SCOPE_EMAIL,
  SCOPE_SMART_CONTRACT_WALLETS,
} from '@proofzero/security/scopes'

import type { AccountURN } from '@proofzero/urns/account'
import type { PersonaData } from '@proofzero/types/application'
import type {
  EmailSelectListItem,
  SCWalletSelectListItem,
} from '@proofzero/utils/getNormalisedConnectedAccounts'
import { redirect } from '@remix-run/cloudflare'

export type DataForScopes = {
  connectedEmails?: EmailSelectListItem[]
  personaData?: PersonaData
  requestedScope: string[]
  connectedAccounts?: GetAddressProfileResult[]
  connectedSmartContractWallets?: SCWalletSelectListItem[]
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

  let connectedSmartContractWallets: SCWalletSelectListItem[] = []
  let connectedEmails: EmailSelectListItem[] = []
  let connectedAddresses: GetAddressProfileResult[] = []

  const accountClient = getAccountClient(jwt || '', env, traceSpan)

  const connectedAccounts = await accountClient.getAddresses.query({
    account: accountURN,
  })

  if (connectedAccounts && connectedAccounts.length) {
    if (requestedScope.includes(Symbol.keyFor(SCOPE_EMAIL)!)) {
      connectedEmails = getNormalisedConnectedEmails(connectedAccounts)
    }
    if (requestedScope.includes(Symbol.keyFor(SCOPE_CONNECTED_ACCOUNTS)!)) {
      connectedAddresses = await Promise.all(
        connectedAccounts.map((ca) => {
          const addressClient = getAddressClient(ca.baseUrn, env, traceSpan)
          return addressClient.getAddressProfile.query()
        })
      )
    }
    if (requestedScope.includes(Symbol.keyFor(SCOPE_SMART_CONTRACT_WALLETS)!)) {
      connectedSmartContractWallets =
        getNormalisedSmartContractWallets(connectedAccounts)
    }
  }

  const personaData: PersonaData = {}

  return {
    connectedEmails,
    personaData,
    requestedScope: reorderScope(requestedScope),
    connectedAccounts: connectedAddresses,
    connectedSmartContractWallets,
  }
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

export async function createAuthzParamCookieAndCreate(
  request: Request,
  authzParams: ConsoleParams,
  env: Env
) {
  let redirectURL
  const qp = new URLSearchParams(request.url)
  if (qp.get('create_type') === 'wallet') {
    redirectURL = `/create/wallet?client_id=${qp.get('client_id')}`
  } else {
    throw new BadRequestError({ message: 'Invalid create_type' })
  }
  throw redirect(redirectURL, {
    headers: await createAuthorizationParamsCookieHeaders(authzParams, env),
  })
}
