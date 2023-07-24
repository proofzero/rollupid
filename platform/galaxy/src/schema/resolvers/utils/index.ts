import { GraphQLError } from 'graphql'
import * as jose from 'jose'
import type { JWTPayload } from 'jose'

import type { AccountURN } from '@proofzero/urns/account'
import createCoreClient from '@proofzero/platform-clients/core'

import Env from '../../../env'
import {
  getAuthzHeaderConditionallyFromToken,
  getAuthzTokenFromReq,
  isFromCFBinding,
} from '@proofzero/utils'

import { WriteAnalyticsDataPoint } from '@proofzero/packages/platform-clients/analytics'

import { NodeType } from '@proofzero/types/address'
import {
  generateTraceContextHeaders,
  TraceSpan,
} from '@proofzero/platform-middleware/trace'
import type { ApplicationURN } from '@proofzero/urns/application'
import { ApplicationURNSpace } from '@proofzero/urns/application'

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

  const accountURN = jwt ? parsedJwt?.sub : undefined

  const clientId = jwt ? parsedJwt?.aud?.[0] : undefined

  return next(
    root,
    args,
    { ...context, jwt, apiKey, accountURN, parsedJwt, clientId },
    info
  )
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
    throw new GraphQLError('You are not authenticated!', {
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
    throw new GraphQLError('You are not authorized!', {
      extensions: {
        http: {
          status: 403,
        },
      },
    })
  }

  return next(root, args, context, info)
}

export const validateApiKey =
  () => (next) => async (root, args, context, info) => {
    //If request isn't coming from a service binding then we check for API key validity;
    //otherwise we passthrough to next middleware
    if (!isFromCFBinding(context.request)) {
      const apiKey = context.apiKey
      if (!apiKey) {
        throw new GraphQLError('No API Key provided.', {
          extensions: {
            http: {
              status: 400,
            },
          },
        })
      }

      const env = context.env as Env
      const traceSpan = context.traceSpan as TraceSpan

      const coreClient = createCoreClient(
        env.Core,
        generateTraceContextHeaders(traceSpan)
      )

      // API key validation
      let apiKeyValidity
      try {
        apiKeyValidity = await coreClient.starbase.checkApiKey.query({ apiKey })
      } catch (e) {
        throw new GraphQLError('Unable to validate given API key.', {
          extensions: {
            http: {
              status: 401,
            },
          },
        })
      }

      if (!apiKeyValidity.valid) {
        throw new GraphQLError('Invalid API key provided.', {
          extensions: {
            http: {
              status: 401,
            },
          },
        })
      }

      // Check matching between ClientId in API Key and in audience list of jwt
      // This is being checked only if jwt is presented
      if (context.jwt && context.jwt.length) {
        const { payload: jwtPayload } =
          await coreClient.access.verifyToken.query({
            token: context.jwt,
          })

        const jwtSub = jose.decodeJwt(apiKey).sub as ApplicationURN
        const clientId = ApplicationURNSpace.parse(jwtSub).decoded

        if (jwtPayload.aud && !jwtPayload.aud.includes(clientId)) {
          throw new GraphQLError(
            "Client ID in API key doesn't match with the one in JWT.",
            {
              extensions: {
                http: {
                  status: 401,
                },
              },
            }
          )
        }

        const { customDomain } =
          await coreClient.starbase.getAppPublicProps.query({
            clientId,
          })
        if (customDomain?.isActive) {
          const expectedIssuer = `https://${customDomain.hostname}`
          if (expectedIssuer != jwtPayload.iss)
            throw new GraphQLError('The access token issuer does not match', {
              extensions: {
                http: {
                  status: 400,
                },
              },
            })
        }
      }
    }

    return next(root, args, context, info)
  }

export async function checkHTTPStatus(response: Response) {
  if (response.status !== 200) {
    const json: { error: string } = await response.json()
    throw new GraphQLError(
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
    let status = Number(json.error.code) > 0 ? Number(json.error.code) : 400
    switch (json.error.message) {
      case 'cannot authorize':
        status = 401
        break
    }
    throw new GraphQLError(
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
  Core,
  jwt,
  traceSpan,
}: {
  accountURN: AccountURN
  Core: Fetcher
  jwt?: string
  traceSpan: TraceSpan
}) => {
  const coreClient = createCoreClient(Core, {
    ...getAuthzHeaderConditionallyFromToken(jwt),
    ...generateTraceContextHeaders(traceSpan),
  })

  const addresses = await coreClient.account.getAddresses.query({
    account: accountURN,
  })

  // for alchemy calls they need to be lowercased
  return addresses
}
