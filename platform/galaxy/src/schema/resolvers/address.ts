import { composeResolvers } from '@graphql-tools/resolvers-composition'

import { Resolvers } from './typedefs'

import {
  setupContext,
  isAuthorized,
} from './utils'

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
    ensAddress: async (_parent, { address }, {}) => {
      const ensRes = await fetch(
        `https://api.ensideas.com/ens/resolve/${address}`
      )

      const res: {
        displayName: string | null
        error?: string
      } = await ensRes.json()

      if (res.error) {
        console.error(`Error requesting ens from address: ${res.error}`)

        throw new Error(res.error)
      }

      // This is either the ENS address or 
      // actual address if no ENS found
      return res.displayName
    },
  },
  Mutation: {},
}

const AddressResolverComposition = {
  'Query.ensAddress': [setupContext()],
  'Mutation.updateThreeIDAddress': [isAuthorized()],
}

export default composeResolvers(addressResolvers, AddressResolverComposition)
