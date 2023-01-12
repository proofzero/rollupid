import { composeResolvers } from '@graphql-tools/resolvers-composition'
import ENSUtils from '@kubelt/platform-clients/ens-utils'
import createAddressClient from '@kubelt/platform-clients/address'
import { AddressURN } from '@kubelt/urns/address'

import {
  AddressProfile,
  CryptoAddressProfile,
  OAuthGoogleProfile,
  OAuthGithubProfile,
  Resolvers,
} from './typedefs'
import { hasApiKey, setupContext, logAnalytics } from './utils'

import { ResolverContext } from './common'
import { OAuthTwitterProfile } from '@kubelt/platform.address/src/types'

const addressResolvers: Resolvers = {
  Query: {
    ensProfile: async (_parent, { addressOrEns }, { env }: ResolverContext) => {
      logAnalytics(
        env.Analytics,
        'ensProfile',
        'query:gql',
        'BEFORE',
        addressOrEns
      )
      return new ENSUtils().getEnsEntry(addressOrEns)
    },
    addressProfile: async (
      _parent: any,
      { addressURN }: { addressURN: AddressURN },
      { env }: ResolverContext
    ) => {
      logAnalytics(
        env.Analytics,
        'addressProfile',
        'query:gql',
        'BEFORE',
        addressURN
      )
      const addressClient = createAddressClient(env.Address, {
        headers: {
          'X-3RN': addressURN,
        },
      })

      const addressProfile = await addressClient.getAddressProfile.query()

      return addressProfile
    },
  },
  Mutation: {},
  AddressProfile: {
    __resolveType: (obj: AddressProfile) => {
      if ((obj as CryptoAddressProfile).address) {
        return 'CryptoAddressProfile'
      }
      if ((obj as OAuthGoogleProfile).sub) {
        return 'OAuthGoogleProfile'
      }
      if ((obj as OAuthTwitterProfile).profile_image_url_https) {
        return 'OAuthTwitterProfile'
      }
      if ((obj as OAuthGithubProfile).avatar_url) {
        return 'OAuthGithubProfile'
      }
      return null
    },
  },
}

// TODO: add address middleware
const AddressResolverComposition = {
  'Query.ensProfile': [setupContext(), hasApiKey()],
  'Query.addressProfile': [setupContext(), hasApiKey()],
}

export default composeResolvers(addressResolvers, AddressResolverComposition)
