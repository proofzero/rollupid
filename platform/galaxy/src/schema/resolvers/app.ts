import { composeResolvers } from '@graphql-tools/resolvers-composition'
import { ResolverContext } from './common'
import type { Resolvers } from './typedefs'
import { hasApiKey, isAuthorized, logAnalytics, setupContext } from './utils'
import createAccessClient from '@kubelt/platform-clients/access'

const appResolvers: Resolvers = {
  Query: {
    scopes: async (
      _parent: any,
      { clientId },
      { env, accountURN }: ResolverContext
    ) => {
      const accessClient = createAccessClient(env.Access)

      const scopes = await accessClient.getAppScopes.query({
        accountURN,
        clientId,
      })

      return scopes
    },
  },
}

const AppResolverComposition = {
  'Query.scopes': [setupContext(), hasApiKey(), isAuthorized(), logAnalytics()],
}

export default composeResolvers(appResolvers, AppResolverComposition)
