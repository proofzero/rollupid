import { composeResolvers } from '@graphql-tools/resolvers-composition'

import { Resolvers } from './typedefs'
import { hasApiKey, setupContext } from './utils'

import { ResolverContext } from './common'
import createAccessClient from '@kubelt/platform-clients/access'
import { ExchangeTokenParams } from '@kubelt/platform.access/src/jsonrpc/methods/exchangeToken'

const accessResolvers: Resolvers = {
  Query: {},
  Mutation: {
    exchangeToken: async (_parent, { exchange }, { env }: ResolverContext) => {
      const accessClient = createAccessClient(env.Access)

      console.log({ exchange })

      const token = await accessClient.exchangeToken.mutate({
        ...exchange,
      } as ExchangeTokenParams)

      return token
    },
  },
}

// TODO: add address middleware
const AccessResolverComposition = {
  'Mutation.exchangeToken': [setupContext(), hasApiKey()],
}

export default composeResolvers(accessResolvers, AccessResolverComposition)
