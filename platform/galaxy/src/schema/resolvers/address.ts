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
    ensAddressAvatar: async (_parent, { address }, {}) =>
      new ENSIdeasUtils().getENSAddressAvatar(address),
  },
  Mutation: {},
}

const AddressResolverComposition = {
  'Query.ensAddress': [setupContext()],
  'Query.ensAddressAvatar': [setupContext()],
  'Mutation.updateThreeIDAddress': [isAuthorized()],
}

export default composeResolvers(addressResolvers, AddressResolverComposition)
