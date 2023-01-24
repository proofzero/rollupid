import { composeResolvers } from '@graphql-tools/resolvers-composition'

import { GrantType, Resolvers, ExchangeTokenInput } from './typedefs'
import { hasApiKey, setupContext } from './utils'

import { ResolverContext } from './common'
import createAccessClient from '@kubelt/platform-clients/access'

const accessResolvers: Resolvers = {
  Query: {},
  Mutation: {
    exchangeAuthorizationToken: async (
      _parent,
      { exchange },
      { env }: ResolverContext
    ) => {
      const accessClient = createAccessClient(env.Access)

      console.log({ exchange })

      if (exchange.grantType === GrantType.AuthorizationCode) {
        return await accessClient.exchangeToken.mutate({
          clientId: exchange.clientId,
          clientSecret: exchange.clientSecret,
          code: exchange.code,
          grantType: exchange.grantType,
          redirectUri: exchange.redirectUri,
        })
      }

      throw new Error('Invalid grant type')
    },
    exchangeRefreshToken: async (
      _parent,
      { exchange },
      { env }: ResolverContext
    ) => {
      const accessClient = createAccessClient(env.Access)

      console.log({ exchange })

      if (exchange.grantType === GrantType.RefreshToken) {
        return await accessClient.exchangeToken.mutate({
          grantType: exchange.grantType,
          token: exchange.token,
        })
      }

      throw new Error('Invalid grant type')
    },
  },
}

// TODO: add address middleware
const AccessResolverComposition = {
  'Mutation.exchangeToken': [setupContext(), hasApiKey()],
  'Mutation.refreshToken': [setupContext(), hasApiKey()],
}

export default composeResolvers(accessResolvers, AccessResolverComposition)
