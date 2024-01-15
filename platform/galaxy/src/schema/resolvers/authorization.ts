import { composeResolvers } from '@graphql-tools/resolvers-composition'
import type { Resolvers } from './typedefs'
import {
  validateApiKey,
  isAuthorized,
  requestLogging,
  setupContext,
  validateJWTAndAPIKeyPresence,
} from './utils'
import { ResolverContext } from './common'
import createCoreClient from '@proofzero/platform-clients/core'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'

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
  ],
  'Mutation.setExternalAppData': [
    requestLogging(),
    setupContext(),
    validateJWTAndAPIKeyPresence(),
    validateApiKey(),
    isAuthorized(),
  ],
}

export default composeResolvers(
  authorizationResolvers,
  AuthorizationResolverComposition
)
