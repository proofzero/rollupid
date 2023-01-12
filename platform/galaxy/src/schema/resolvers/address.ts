import { composeResolvers } from '@graphql-tools/resolvers-composition'
import ENSUtils from '@kubelt/platform-clients/ens-utils'
import { Resolvers } from './typedefs'

import { hasApiKey, setupContext, logAnalytics } from './utils'

const addressResolvers: Resolvers = {
  Query: {
    ensDisplayName: async (_parent, { addressOrEns }, { env }) => {
      // logAnalytics
      console.log(env.Analytics)
      return new ENSUtils().getENSDisplayName(addressOrEns)
    },
    ensAddress: async (_parent, { addressOrEns }, { env }) => {
      // logAnalytics
      console.log(env.Analytics)
      return new ENSUtils().getENSAddress(addressOrEns)
    },
    ensAddressAvatar: async (_parent, { addressOrEns }, { env }) => {
      // logAnalytics
      console.log(env.Analytics)
      return new ENSUtils().getENSAddressAvatar(addressOrEns)
    }
  },
  Mutation: {},
}

const AddressResolverComposition = {
  'Query.ensDisplayName': [setupContext(), hasApiKey()],
  'Query.ensAddress': [setupContext(), hasApiKey()],
  'Query.ensAddressAvatar': [setupContext(), hasApiKey()],
}

export default composeResolvers(addressResolvers, AddressResolverComposition)
