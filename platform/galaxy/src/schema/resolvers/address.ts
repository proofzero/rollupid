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
  AddressProfiles,
} from './typedefs'
import { hasApiKey, setupContext, logAnalytics } from './utils'

import { ResolverContext } from './common'
import {
  OAuthMicrosoftProfile,
  OAuthTwitterProfile,
} from '@kubelt/platform.address/src/types'
import { CryptoAddressType } from '@kubelt/types/address'
import { PlatformJWTAssertionHeader } from '@kubelt/types/headers'

const addressResolvers: Resolvers = {
  Query: {
    ensProfile: async (_parent, { addressOrEns }, { env }: ResolverContext) => {
      return new ENSUtils().getEnsEntry(addressOrEns)
    },
    addressProfile: async (
      _parent: any,
      { addressURN }: { addressURN: AddressURN },
      { env }: ResolverContext
    ) => {
      const addressClient = createAddressClient(env.Address, {
        headers: {
          [PlatformJWTAssertionHeader]: addressURN,
        },
      })

      const addressProfile = await addressClient.getAddressProfile.query()

      return addressProfile
    },
  },
  Mutation: {},

  AddressProfiles: {
    __resolveType: (obj: AddressProfiles) => {
      if ((obj as CryptoAddressProfile).address) {
        return 'CryptoAddressProfile'
      }
      if ((obj as OAuthGoogleProfile).picture) {
        return 'OAuthGoogleProfile'
      }
      if ((obj as OAuthTwitterProfile).profile_image_url_https) {
        return 'OAuthTwitterProfile'
      }
      if ((obj as OAuthGithubProfile).avatar_url) {
        return 'OAuthGithubProfile'
      }
      if ((obj as OAuthMicrosoftProfile).sub) {
        return 'OAuthGithubProfile'
      }
      return null
    },
  },
}

// TODO: add address middleware
const AddressResolverComposition = {
  'Query.ensProfile': [setupContext(), hasApiKey(), logAnalytics()],
  'Query.addressProfile': [setupContext(), hasApiKey(), logAnalytics()],
}

export default composeResolvers(addressResolvers, AddressResolverComposition)
