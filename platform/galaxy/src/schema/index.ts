import { createSchema } from 'graphql-yoga'
import { mergeTypeDefs } from '@graphql-tools/merge'
import GraphQLJSON from 'graphql-type-json'

import types from './types'
import { addressResolver, accountResolver, appResolver } from './resolvers'
import { GalaxyServerContext } from '..'

const mergedTypes = mergeTypeDefs(types)

export default createSchema<GalaxyServerContext>({
  typeDefs: mergedTypes,
  resolvers: [
    addressResolver,
    accountResolver,
    appResolver,
    {
      JSON: GraphQLJSON,
    },
  ],
})
