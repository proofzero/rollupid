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
      { env, jwt, traceSpan, identityURN, clientId }: ResolverContext
    ) => {
      const coreClient = createCoreClient(env.Core, {
        ...getAuthzHeaderConditionallyFromToken(jwt),
        ...generateTraceContextHeaders(traceSpan),
      })

      return null
    },
  },
  Mutation: {
    setExternalData: async (
      _parent: any,
      { payload },
      { env, jwt, traceSpan, identityURN, clientId }: ResolverContext
    ) => {
      const coreClient = createCoreClient(env.Core, {
        ...getAuthzHeaderConditionallyFromToken(jwt),
        ...generateTraceContextHeaders(traceSpan),
      })

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
