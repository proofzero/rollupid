import { composeResolvers } from '@graphql-tools/resolvers-composition'
import ENSUtils from '@kubelt/platform-clients/ens-utils'
import createAddressClient from '@kubelt/platform-clients/address'
import { AddressURN } from '@kubelt/urns/address'

import { Resolvers } from './typedefs'
import { hasApiKey, setupContext, logAnalytics, isAuthorized } from './utils'

import { ResolverContext } from './common'

import {
  AddressProfiles,
  CryptoAddressProfile,
  OAuthGithubProfile,
  OAuthGoogleProfile,
  OAuthMicrosoftProfile,
  OAuthTwitterProfile,
} from '@kubelt/platform.address/src/types'
import {
  PlatformAddressURNHeader,
  PlatformJWTAssertionHeader,
} from '@kubelt/types/headers'

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
          [PlatformAddressURNHeader]: addressURN,
        },
      })

      const addressProfile = await addressClient.getAddressProfile.query()

      return addressProfile
    },
    addressProfiles: async (
      _parent: any,
      { addressURNList }: { addressURNList: AddressURN[] },
      { env, jwt }: ResolverContext
    ) => {
      const profiles = await Promise.all(
        addressURNList.map(async (urn) => {
          const addressClient = createAddressClient(env.Address, {
            headers: {
              [PlatformAddressURNHeader]: urn,
            },
          })

          return addressClient.getAddressProfile.query()
        })
      )

      return profiles
    },
  },
  Mutation: {
    updateAddressNickname: async (
      _parent: any,
      { nickname, addressURN },
      { env }: ResolverContext
    ) => {
      const addressClient = createAddressClient(env.Address, {
        headers: {
          [PlatformAddressURNHeader]: addressURN,
        },
      })

      await addressClient.setNickname.query({
        nickname,
      })

      return true
    },
  },
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
        return 'OAuthMicrosoftProfile'
      }
      return null
    },
  },
}

// TODO: add address middleware
const AddressResolverComposition = {
  'Query.ensProfile': [setupContext(), hasApiKey()],
  'Query.addressProfile': [setupContext(), hasApiKey()],
  'Query.addressProfiles': [setupContext(), hasApiKey()],
  'Mutation.updateAddressNickname': [
    setupContext(),
    hasApiKey(),
    isAuthorized(),
  ],
}

export default composeResolvers(addressResolvers, AddressResolverComposition)
