import { composeResolvers } from '@graphql-tools/resolvers-composition'
import ENSUtils from './clients/ens-utils'
import { Resolvers } from './typedefs'

import { setupContext, isAuthorized } from './utils'

const addressResolvers: Resolvers = {
  Query: {
    ensAddress: async (_parent, { address }, {}) =>
      new ENSUtils().getENSAddress(address),
    ensAddressAvatar: async (_parent, { address }, {}) =>
      new ENSUtils().getENSAddressAvatar(address),
  },
  Mutation: {},
}

const AddressResolverComposition = {
  'Query.ensAddress': [setupContext()],
  'Query.ensAddressAvatar': [setupContext()],
}

export default composeResolvers(addressResolvers, AddressResolverComposition)
