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
import createAccessClient from '@proofzero/platform-clients/access'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'

const appResolvers: Resolvers = {
  Query: {
    scopes: async (
      _parent: any,
      { clientId },
      { env, accountURN, traceSpan }: ResolverContext
    ) => {
      const accessClient = createAccessClient(
        env.Access,
        generateTraceContextHeaders(traceSpan)
      )

      const scopes = await accessClient.getAuthorizedAppScopes.query({
        accountURN,
        clientId,
      })

      return scopes
    },
  },
  Mutation: {
    revokeAppAuthorization: async (
      _parent: any,
      { clientId },
      { env, jwt, traceSpan }: ResolverContext
    ) => {
      const accessClient = createAccessClient(env.Access, {
        ...getAuthzHeaderConditionallyFromToken(jwt),
        ...generateTraceContextHeaders(traceSpan),
      })

      await accessClient.revokeAppAuthorization.mutate({
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
