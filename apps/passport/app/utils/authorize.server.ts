import { getAccountClient, getAddressClient } from '~/platform.server'
import {
  getEmailDropdownItems,
  getAddressDropdownItems,
} from '@proofzero/utils/getNormalisedConnectedAccounts'

import { BadRequestError, UnauthorizedError } from '@proofzero/errors'
import { createAuthorizationParamsCookieHeaders } from '~/session.server'

import {
  SCOPE_CONNECTED_ACCOUNTS,
  SCOPE_EMAIL,
  SCOPE_SMART_CONTRACT_WALLETS,
} from '@proofzero/security/scopes'

import type { AccountURN } from '@proofzero/urns/account'
import type { PersonaData } from '@proofzero/types/application'
import { redirect } from '@remix-run/cloudflare'
import { CryptoAddressType, NodeType } from '@proofzero/types/address'
import { DropdownSelectListItem } from '@proofzero/design-system/src/atoms/dropdown/DropdownSelectList'

export type DataForScopes = {
  connectedEmails: DropdownSelectListItem[]
  personaData: PersonaData
  requestedScope: string[]
  connectedAccounts: DropdownSelectListItem[]
  connectedSmartContractWallets: DropdownSelectListItem[]
}

// Deterministically sort scopes so that they are always in the same order
// when returned to the client. Email is always last.
// -----------------------------------------------------------------------------
const orderOfScopes: Record<string, number> = {
  openid: 0,
  system_identifiers: 0,
  profile: 1,
  email: 2,
  connected_accounts: 3,
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

  let connectedSmartContractWallets: Array<DropdownSelectListItem> = []
  let connectedEmails: Array<DropdownSelectListItem> = []
  let connectedAddresses: Array<DropdownSelectListItem> = []

  const accountClient = getAccountClient(jwt || '', env, traceSpan)

  const connectedAccounts = await accountClient.getAddresses.query({
    account: accountURN,
  })

  if (connectedAccounts && connectedAccounts.length) {
    if (requestedScope.includes(Symbol.keyFor(SCOPE_EMAIL)!)) {
      connectedEmails = getEmailDropdownItems(connectedAccounts, true)
    }
    if (requestedScope.includes(Symbol.keyFor(SCOPE_CONNECTED_ACCOUNTS)!)) {
      const addresses = (await Promise.all(
        connectedAccounts
          .filter((ca) => {
            return (ca.rc.node_type === NodeType.OAuth ||
              ca.rc.node_type === NodeType.Email ||
              ca.rc.node_type === NodeType.Crypto) &&
              ca.rc.addr_type !== CryptoAddressType.Wallet
          })
          .map((ca) => {
            const addressClient = getAddressClient(ca.baseUrn, env, traceSpan)
            return addressClient.getAddressProfile.query()
          })
      ))
      connectedAddresses = getAddressDropdownItems(addresses)
    }
    if (requestedScope.includes(Symbol.keyFor(SCOPE_SMART_CONTRACT_WALLETS)!)) {
      const addresses = await Promise.all(
        connectedAccounts
          .filter((ca) => {
            return ca.rc.addr_type === CryptoAddressType.Wallet
          })
          .map((ca) => {
            const addressClient = getAddressClient(ca.baseUrn, env, traceSpan)
            return addressClient.getAddressProfile.query()
          })
      )
      connectedSmartContractWallets = getAddressDropdownItems(addresses)
      if (connectedSmartContractWallets?.length) {
        connectedSmartContractWallets[0].selected = true
      }
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
  authzCookieParams: AuthzParams,
  authzQueryParams: AuthzParams
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
  authzParams: AuthzParams,
  env: Env
) {
  let redirectURL
  const qp = new URLSearchParams(request.url)
  if (qp.get('create_type') === 'wallet') {
    redirectURL = `/create/wallet`
  } else {
    throw new BadRequestError({ message: 'Invalid create_type' })
  }
  throw redirect(redirectURL, {
    headers: await createAuthorizationParamsCookieHeaders(
      request,
      authzParams,
      env
    ),
  })
}
