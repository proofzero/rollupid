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
    revokeAuthorizations: async (
      _parent: any,
      { clientId, clientSecret },
      { accountURN, env }: ResolverContext
    ) => {
      const accessClient = createAccessClient(env.Access)

      await accessClient.revokeAuthorizations.mutate({
        accountURN,
        clientId,
        clientSecret,
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
  'Mutation.revokeAuthorizations': [
    setupContext(),
    hasApiKey(),
    isAuthorized(),
    logAnalytics(),
  ],
}

export default composeResolvers(appResolvers, AppResolverComposition)
