import { composeResolvers } from '@graphql-tools/resolvers-composition'
import type { Resolvers } from './typedefs'
import {
  validateApiKey,
  isAuthorized,
  logAnalytics,
  requestLogging,
  setupContext,
} from './utils'
import { ResolverContext } from './common'
import createCoreClient from '@proofzero/platform-clients/core'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'

const authorizationResolvers: Resolvers = {
  Query: {
    getExternalData: async (
      _parent: any,
      {},
      { env, jwt, traceSpan, clientId }: ResolverContext
    ) => {
      const coreClient = createCoreClient(env.Core, {
        ...getAuthzHeaderConditionallyFromToken(jwt),
        ...generateTraceContextHeaders(traceSpan),
      })

      return coreClient.authorization.getExternalData.query({
        clientId,
      })
    },
  },
  Mutation: {
    setExternalData: async (
      _parent: any,
      { payload },
      { env, jwt, traceSpan, clientId }: ResolverContext
    ) => {
      const coreClient = createCoreClient(env.Core, {
        ...getAuthzHeaderConditionallyFromToken(jwt),
        ...generateTraceContextHeaders(traceSpan),
      })

      try {
        await coreClient.authorization.setExternalData.mutate({
          clientId,
          payload,
        })
      } catch (ex) {
        console.error(ex)
        return false
      }

      return true
    },
  },
}

const AuthorizationResolverComposition = {
  'Query.getExternalData': [
    requestLogging(),
    setupContext(),
    validateApiKey(),
    isAuthorized(),
    logAnalytics(),
  ],
  'Mutation.setExternalData': [
    requestLogging(),
    setupContext(),
    validateApiKey(),
    isAuthorized(),
    logAnalytics(),
  ],
}

export default composeResolvers(
  authorizationResolvers,
  AuthorizationResolverComposition
)
