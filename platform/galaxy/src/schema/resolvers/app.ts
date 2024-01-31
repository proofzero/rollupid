import { composeResolvers } from '@graphql-tools/resolvers-composition'
import { ResolverContext } from './common'
import type { Resolvers } from './typedefs'
import {
  validateApiKey,
  isAuthorized,
  logAnalytics,
  requestLogging,
  setupContext,
} from './utils'
import createCoreClient from '@proofzero/platform-clients/core'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import core from '@proofzero/platform-clients/core'

const appResolvers: Resolvers = {
  Query: {
    scopes: async (
      _parent: any,
      { clientId },
      { env, identityURN, traceSpan }: ResolverContext
    ) => {
      const coreClient = createCoreClient(
        env.Core,
        generateTraceContextHeaders(traceSpan)
      )

      const scopes =
        await coreClient.authorization.getAuthorizedAppScopes.query({
          identityURN,
          clientId,
        })

      return scopes.claimValues
    },
  },
  Mutation: {
    revokeAppAuthorization: async (
      _parent: any,
      { clientId },
      { env, jwt, traceSpan }: ResolverContext
    ) => {
      const coreClient = createCoreClient(env.Core, {
        ...getAuthzHeaderConditionallyFromToken(jwt),
        ...generateTraceContextHeaders(traceSpan),
      })

      await coreClient.authorization.revokeAppAuthorization.mutate({
        clientId,
      })

      return true
    },
  },
}

const AppResolverComposition = {
  'Query.scopes': [
    requestLogging(),
    setupContext(),
    validateApiKey(),
    isAuthorized(),
    logAnalytics(),
  ],
  'Mutation.revokeAppAuthorization': [
    requestLogging(),
    setupContext(),
    validateApiKey(),
    isAuthorized(),
    logAnalytics(),
  ],
}

export default composeResolvers(appResolvers, AppResolverComposition)
