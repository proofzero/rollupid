import { composeResolvers } from '@graphql-tools/resolvers-composition'
import ENSIdeasUtils from './clients/ens-utils'

import { Resolvers } from './typedefs'

import { setupContext, isAuthorized } from './utils'

const addressResolvers: Resolvers = {
  Query: {
    address: (
      _parent,
      { address },
      {
        /* oort send, jwt */
      }
    ) => {
      return null
    },
    addresses: (
      _parent,
      _args,
      {
        /* oort send, jwt */
      }
    ) => {
      return []
    },
    ensAddress: async (_parent, { address }, {}) =>
      new ENSIdeasUtils().getENSAddress(address),
  },
  Mutation: {},
}

const AddressResolverComposition = {
  'Query.ensAddress': [setupContext()],
  'Mutation.updateThreeIDAddress': [isAuthorized()],
}

export default composeResolvers(addressResolvers, AddressResolverComposition)
