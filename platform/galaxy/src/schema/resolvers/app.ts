import { composeResolvers } from '@graphql-tools/resolvers-composition'
import { ResolverContext } from './common'
import type { Resolvers } from './typedefs'
import {
  hasApiKey,
  isAuthorized,
  logAnalytics,
  requestLogging,
  setupContext,
} from './utils'
import createAccessClient from '@kubelt/platform-clients/access'
import { getAuthzHeaderConditionallyFromToken } from '@kubelt/utils'

const appResolvers: Resolvers = {
  Query: {
    scopes: async (
      _parent: any,
      { clientId },
      { env, accountURN }: ResolverContext
    ) => {
      const accessClient = createAccessClient(env.Access)

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
      { env, jwt }: ResolverContext
    ) => {
      const accessClient = createAccessClient(
        env.Access,
        getAuthzHeaderConditionallyFromToken(jwt)
      )

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
    hasApiKey(),
    isAuthorized(),
    logAnalytics(),
  ],
  'Mutation.revokeAppAuthorization': [
    requestLogging(),
    setupContext(),
    hasApiKey(),
    isAuthorized(),
    logAnalytics(),
  ],
}

export default composeResolvers(appResolvers, AppResolverComposition)
