import { createSchema } from 'graphql-yoga'
import { mergeTypeDefs } from '@graphql-tools/merge'
import GraphQLJSON from 'graphql-type-json'

import types from './types'
import { accountResolver, appResolver, identityResolver } from './resolvers'
import { GalaxyServerContext } from '..'

const mergedTypes = mergeTypeDefs(types)

export default createSchema<GalaxyServerContext>({
  typeDefs: mergedTypes,
  resolvers: [
    accountResolver,
    appResolver,
    identityResolver,
    {
      JSON: GraphQLJSON,
    },
  ],
})
