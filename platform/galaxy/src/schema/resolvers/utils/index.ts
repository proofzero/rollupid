import { GraphQLYogaError } from '@graphql-yoga/common'
import * as jose from 'jose'
import type { JWTPayload } from 'jose'

import { AccountURN } from '@kubelt/urns/account'
import createStarbaseClient from '@kubelt/platform-clients/starbase'
import createAccountClient from '@kubelt/platform-clients/account'

import Env from '../../../env'
import {
  getAuthzHeaderConditionallyFromToken,
  getAuthzTokenFromReq,
  isFromCFBinding,
} from '@kubelt/utils'

import { WriteAnalyticsDataPoint } from '@kubelt/packages/platform-clients/analytics'
export {
  getNfts,
  getAlchemyClients,
  sliceIntoChunks,
  normalizeContracts,
  getContractsForAllChains,
  validOwnership,
  getNftsForAllChains,
  sortNftsAlphabetically,
  getNftMetadataForAllChains,
  normalizeContractsForAllChains,
} from './nfts'

import { NodeType } from '@kubelt/types/address'
import {
  generateTraceContextHeaders,
  TraceSpan,
} from '@kubelt/platform-middleware/trace'

// 404: 'USER_NOT_FOUND' as string,
export function parseJwt(token: string): JWTPayload {
  const payload = jose.decodeJwt(token)
  if (!payload) {
    throw new Error('Invalid JWT')
  }
  return payload
}

export const requestLogging =
  () => (next) => async (root, args, context, info) => {
    const startTime = Date.now()
    console.debug(
      `Starting GQL handler, operation: ${context.operationName} resolver: ${info.fieldName} trace span: ${context.traceSpan}`
    )
    const result = await next(root, args, context, info)
    console.debug(
      `Completed GQL handler, operation: ${context.operationName} resolver: ${info.fieldName} traceSpan: ${context.traceSpan}`
    )
    return result
  }

export const setupContext = () => (next) => (root, args, context, info) => {
  const jwt = getAuthzTokenFromReq(context.request)
  const apiKey = context.request.headers.get('X-GALAXY-KEY')

  const parsedJwt = jwt && parseJwt(jwt)

  const accountURN: AccountURN = parsedJwt && parsedJwt.sub

  return next(root, args, { ...context, jwt, apiKey, accountURN }, info)
}

// TODO: Remove this middleware and it's use once scopes are fully implemented
// This is being added as a temporary measure to only display public data when
// accessed through the external Galaxy interface, even when jwt is provided
export const temporaryConvertToPublic =
  () => (next) => (root, args, context, info) => {
    if (!isFromCFBinding(context.request) && context.jwt) delete context.jwt
    return next(root, args, context, info)
  }

export const isAuthorized = () => (next) => (root, args, context, info) => {
  if (!context.jwt) {
    throw new GraphQLYogaError('You are not authenticated!', {
      extensions: {
        http: {
          status: 401,
        },
      },
    })
  }

  if (!isFromCFBinding(context.request)) {
    // TODO: update to check if user is authorized with authorzation header
    // Currently, until write scopes are implemented, this middleware will always
    // return http 403, unless call is coming internally from service binding
    throw new GraphQLYogaError('You are not authorized!', {
      extensions: {
        http: {
          status: 403,
        },
      },
    })
  }

  return next(root, args, context, info)
}

export const hasApiKey = () => (next) => async (root, args, context, info) => {
  //If request isn't coming from a service binding then we check for API key validity;
  //otherwise we passthrough to next middleware
  if (!isFromCFBinding(context.request)) {
    const apiKey = context.apiKey
    if (!apiKey) {
      throw new GraphQLYogaError('No API Key provided.', {
        extensions: {
          http: {
            status: 400,
          },
        },
      })
    }

    const env = context.env as Env
    const traceSpan = context.traceSpan as TraceSpan
    const starbaseClient = createStarbaseClient(
      env.Starbase,
      generateTraceContextHeaders(traceSpan)
    )

    let apiKeyValidity
    try {
      apiKeyValidity = await starbaseClient.checkApiKey.query({ apiKey })
    } catch (e) {
      throw new GraphQLYogaError('Unable to validate given API key.', {
        extensions: {
          http: {
            status: 401,
          },
        },
      })
    }

    if (!apiKeyValidity.valid) {
      throw new GraphQLYogaError('Invalid API key provided.', {
        extensions: {
          http: {
            status: 401,
          },
        },
      })
    }
  }

  return next(root, args, context, info)
}

export async function checkHTTPStatus(response: Response) {
  if (response.status !== 200) {
    const json: { error: string } = await response.json()
    throw new GraphQLYogaError(
      `Error: ${response.status} ${response.statusText}: ${json.error}`,
      {
        extensions: {
          http: {
            status: response.status,
          },
        },
      }
    )
  }
}

export async function getRPCResult(response: Response) {
  const json: {
    error?: { message: string; code: string }
    result?: { value: any }
  } = await response.json()
  if (json.error) {
    // TODO: we should get proper error codes from the RPC
    let status = parseInt(json.error.code) > 0 ? json.error.code : 400
    switch (json.error.message) {
      case 'cannot authorize':
        status = 401
        break
    }
    throw new GraphQLYogaError(
      `Error: ${json.error?.code} ${json.error?.message}`,
      {
        extensions: {
          http: {
            status,
          },
        },
      }
    )
  }
  return json.result?.value
}

export const logAnalytics =
  () => (next) => async (root, args, context, info) => {
    const method = info?.operation?.name?.value || 'unknown'
    const type = [info?.operation?.operation || 'unknown', 'gql'].join(':')

    const datapoint: AnalyticsEngineDataPoint = {
      blobs: [method, type, context.apiKey],
    }

    WriteAnalyticsDataPoint(context, datapoint)

    return next(root, args, context, info)
  }

export const getConnectedAddresses = async ({
  accountURN,
  Account,
  jwt,
  traceSpan,
}: {
  accountURN: AccountURN
  Account: Fetcher
  jwt?: string
  traceSpan: TraceSpan
}) => {
  const accountClient = createAccountClient(Account, {
    ...getAuthzHeaderConditionallyFromToken(jwt),
    ...generateTraceContextHeaders(traceSpan),
  })

  const addresses = await accountClient.getAddresses.query({
    account: accountURN,
  })

  // for alchemy calls they need to be lowercased
  return addresses
}

export const getConnectedCryptoAddresses = async ({
  accountURN,
  Account,
  jwt,
  traceSpan,
}: {
  accountURN: AccountURN
  Account: Fetcher
  jwt?: string
  traceSpan: TraceSpan
}) => {
  const cryptoAddresses =
    (await getConnectedAddresses({
      accountURN,
      Account,
      jwt,
      traceSpan,
    })) || []

  return cryptoAddresses
    .filter((address) =>
      [NodeType.Crypto, NodeType.Vault].includes(address.rc.node_type)
    )
    .map((address) => address.qc.alias.toLowerCase())
}
