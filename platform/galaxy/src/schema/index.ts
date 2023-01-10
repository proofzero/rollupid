import { makeExecutableSchema } from '@graphql-tools/schema'
import { mergeTypeDefs } from '@graphql-tools/merge'
import GraphQLJSON from 'graphql-type-json'

import types from './types'
import { addressResolver, profileResolver, nftsResolver } from './resolvers'

const mergedTypes = mergeTypeDefs(types)

export default makeExecutableSchema({
  typeDefs: mergedTypes,
  resolvers: [
    addressResolver,
    profileResolver,
    nftsResolver,
    {
      JSON: GraphQLJSON,
    },
  ],
})
