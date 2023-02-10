import { composeResolvers } from '@graphql-tools/resolvers-composition'

import createStarbaseClient from '@kubelt/platform-clients/starbase'

import { setupContext, isAuthorized, hasApiKey, logAnalytics } from './utils'

import { Resolvers } from './typedefs'
import { ResolverContext } from './common'
import { getAuthzHeaderConditionallyFromToken } from '@kubelt/utils'

const accountResolvers: Resolvers = {
  Query: {
    appUsers: async (
      _parent: any,
      { clientId }: { clientId: string },
      { env, accountURN, jwt }: ResolverContext
    ) => {
      const starbaseClient = createStarbaseClient(
        env.Starbase,
        getAuthzHeaderConditionallyFromToken(jwt)
      )

      console.log({
        accountURN,
        clientId,
      })

      const appUserUrns = await starbaseClient.listAppAccounts.query({
        clientId,
      })

      console.log({
        appUserUrns,
      })

      // TODO: Use user urns to fetch details
      // such as displayName & iconUrl
      // and merge it with the timestamps
      // returned by starbase

      return []
    },
  },
}

const ProfileResolverComposition = {
  'Query.appUsers': [
    setupContext(),
    hasApiKey(),
    isAuthorized(),
    logAnalytics(),
  ],
}

export default composeResolvers(accountResolvers, ProfileResolverComposition)
