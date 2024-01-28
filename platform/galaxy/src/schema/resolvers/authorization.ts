import { composeResolvers } from '@graphql-tools/resolvers-composition'
import type { Resolvers } from './typedefs'
import {
  validateApiKey,
  isAuthorized,
  logAnalytics,
  requestLogging,
  setupContext,
  validateJWTAndAPIKeyPresence,
} from './utils'
import { ResolverContext } from './common'
import createCoreClient from '@proofzero/platform-clients/core'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { GraphQLError } from 'graphql/error'
import { AppAPIKeyHeader } from '@proofzero/types/headers'
import {
  ApplicationURN,
  ApplicationURNSpace,
} from '@proofzero/urns/application'
import * as jose from 'jose'

const authorizationResolvers: Resolvers = {
  Query: {
    getExternalAppData: async (
      _parent: any,
      {},
      { env, jwt, traceSpan, clientId }: ResolverContext
    ) => {
      const coreClient = createCoreClient(env.Core, {
        ...getAuthzHeaderConditionallyFromToken(jwt),
        ...generateTraceContextHeaders(traceSpan),
      })

      return coreClient.authorization.getExternalAppData.query({
        clientId,
      })
    },
    getAuthorizedIdentities: async (
      _parent: any,
      { opts }: { opts: { limit: number; offset: number } },
      { env, apiKey, traceSpan }: ResolverContext
    ) => {
      const coreClient = createCoreClient(env.Core, {
        ...generateTraceContextHeaders(traceSpan),
        [AppAPIKeyHeader]: apiKey,
      })
      const { limit, offset } = opts

      //Check if valid numbers, including value of 0 for offset
      if (
        limit == null ||
        offset == null ||
        !Number.isInteger(limit) ||
        !Number.isInteger(offset) ||
        limit > 50 ||
        limit < 1
      )
        throw new GraphQLError(
          'Limit and offset numbers need to be provided, with the limit beging between 1 and 50'
        )

      let clientIdFromApiKey
      try {
        const apiKeyApplicationURN = jose.decodeJwt(apiKey)
          .sub as ApplicationURN
        clientIdFromApiKey =
          ApplicationURNSpace.nss(apiKeyApplicationURN).split('/')[1]
      } catch (e) {
        console.error('Error parsing clientId', e)
        throw new GraphQLError('Could not retrieve clientId from API key.')
      }

      const edgeResults =
        await coreClient.starbase.getAuthorizedIdentities.query({
          client: clientIdFromApiKey,
          opt: {
            limit,
            offset,
          },
        })
      return edgeResults.identities.map(({ identityURN, imageURL, name }) => {
        return { identityURN, imageURL, name }
      })
    },
  },
  Mutation: {
    setExternalAppData: async (
      _parent: any,
      { payload },
      { env, jwt, traceSpan, clientId }: ResolverContext
    ) => {
      const coreClient = createCoreClient(env.Core, {
        ...getAuthzHeaderConditionallyFromToken(jwt),
        ...generateTraceContextHeaders(traceSpan),
      })

      await coreClient.authorization.setExternalAppData.mutate({
        clientId,
        payload,
      })

      return true
    },
  },
}

const AuthorizationResolverComposition = {
  'Query.getExternalAppData': [
    requestLogging(),
    setupContext(),
    validateJWTAndAPIKeyPresence(),
    validateApiKey(),
    isAuthorized(),
    logAnalytics(),
  ],
  'Query.getAuthorizedIdentities': [
    requestLogging(),
    setupContext(),
    validateApiKey(),
    logAnalytics(),
  ],
  'Mutation.setExternalAppData': [
    requestLogging(),
    setupContext(),
    validateJWTAndAPIKeyPresence(),
    validateApiKey(),
    isAuthorized(),
    logAnalytics(),
  ],
}

export default composeResolvers(
  authorizationResolvers,
  AuthorizationResolverComposition
)
