import { getCoreClient } from '~/platform.server'
import {
  getEmailDropdownItems,
  getAccountDropdownItems,
} from '@proofzero/utils/getNormalisedConnectedAccounts'

import { BadRequestError, UnauthorizedError } from '@proofzero/errors'
import { createAuthorizationParamsCookieHeaders } from '~/session.server'

import {
  SCOPE_CONNECTED_ACCOUNTS,
  SCOPE_EMAIL,
  SCOPE_SMART_CONTRACT_WALLETS,
} from '@proofzero/security/scopes'

import type { IdentityURN } from '@proofzero/urns/identity'
import type { PersonaData } from '@proofzero/types/application'
import { redirect } from '@remix-run/cloudflare'
import {
  CryptoAccountType,
  EmailAccountType,
  NodeType,
  OAuthAccountType,
} from '@proofzero/types/account'
import type { DropdownSelectListItem } from '@proofzero/design-system/src/atoms/dropdown/DropdownSelectList'
import type { AccountURN } from '@proofzero/urns/account'
import { Address } from 'viem'
import { NO_OP_ACCOUNT_PLACEHOLDER } from '@proofzero/platform.account/src/constants'

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
  identityURN: IdentityURN,
  jwt?: string,
  env?: any,
  traceSpan?: any
): Promise<DataForScopes> => {
  if (!identityURN)
    throw new UnauthorizedError({ message: 'Identity URN is required' })

  let connectedSmartContractWallets: Array<DropdownSelectListItem> = []
  let connectedEmails: Array<DropdownSelectListItem> = []
  let connectedAddresses: Array<DropdownSelectListItem> = []

  const context = { env: { Core: env.Core }, traceSpan }
  const coreClient = getCoreClient({ context, jwt })

  const connectedAccounts = await coreClient.identity.getAccounts.query({
    URN: identityURN,
  })

  if (connectedAccounts && connectedAccounts.length) {
    if (requestedScope.includes(Symbol.keyFor(SCOPE_EMAIL)!)) {
      connectedEmails = getEmailDropdownItems(connectedAccounts)
    }
    if (requestedScope.includes(Symbol.keyFor(SCOPE_CONNECTED_ACCOUNTS)!)) {
      const accounts = connectedAccounts
        .filter(({ rc: { addr_type, node_type } }) => {
          switch (node_type) {
            case NodeType.Email:
              return addr_type === EmailAccountType.Email
            case NodeType.Crypto:
              return addr_type !== CryptoAccountType.Wallet
            case NodeType.OAuth:
            case NodeType.WebAuthN:
              return true
          }
        })
        .map((ca) => {
          return ca.baseUrn as AccountURN
        })

      const accountProfiles =
        await coreClient.account.getAccountProfileBatch.query(accounts)
      connectedAddresses = getAccountDropdownItems(accountProfiles)

      if (connectedEmails.length) {
        connectedAddresses = connectedAddresses.map((ca) => {
          const emailAccount = connectedEmails.find(
            (ce) => ca.value === ce.value
          )
          if (!emailAccount) return ca
          if (!emailAccount.mask) return ca
          return {
            ...ca,
            mask: emailAccount.mask,
          }
        })
      }
    }
    if (requestedScope.includes(Symbol.keyFor(SCOPE_SMART_CONTRACT_WALLETS)!)) {
      const accounts = connectedAccounts
        .filter((ca) => {
          return ca.rc.addr_type === CryptoAccountType.Wallet
        })
        .map((ca) => {
          return ca.baseUrn as AccountURN
        })
      const accountProfiles =
        await coreClient.account.getAccountProfileBatch.query(accounts)
      connectedSmartContractWallets = getAccountDropdownItems(accountProfiles)
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

export async function createNewSCWallet({
  nickname,
  primaryAccountURN,
  env,
  traceSpan,
}: {
  nickname: string
  primaryAccountURN: AccountURN
  env: Env
  traceSpan?: any
}) {
  const context = { env: { Core: env.Core }, traceSpan }
  const coreClient = getCoreClient({ context, accountURN: primaryAccountURN })
  const { accountURN } = await coreClient.account.initSmartContractWallet.query(
    {
      nickname,
    }
  )
  return { accountURN }
}
