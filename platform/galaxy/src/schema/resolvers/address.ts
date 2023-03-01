import { composeResolvers } from '@graphql-tools/resolvers-composition'
import ENSUtils from '@kubelt/platform-clients/ens-utils'
import createAddressClient from '@kubelt/platform-clients/address'
import { AddressURN, AddressURNSpace } from '@kubelt/urns/address'

import { AddressProfilesUnion, Resolvers } from './typedefs'
import { hasApiKey, setupContext, isAuthorized, requestLogging } from './utils'

import { ResolverContext } from './common'

import {
  CryptoAddressProfile,
  OAuthAppleProfile,
  OAuthDiscordProfile,
  OAuthGithubProfile,
  OAuthGoogleProfile,
  OAuthMicrosoftProfile,
  OAuthTwitterProfile,
} from '@kubelt/platform.address/src/types'
import { PlatformAddressURNHeader } from '@kubelt/types/headers'
import { EDGE_ADDRESS } from '@kubelt/platform.address/src/constants'

const addressResolvers: Resolvers = {
  Query: {
    ensProfile: async (_parent, { addressOrEns }, { env }: ResolverContext) => {
      return new ENSUtils().getEnsEntry(addressOrEns)
    },
    account: async (
      _parent,
      { addressURN }: { addressURN: AddressURN },
      { env }
    ) => {
      const addressClient = createAddressClient(env.Address, {
        [PlatformAddressURNHeader]: addressURN,
      })

      const accountURN = await addressClient.getAccount.query()

      return accountURN
    },
    addressProfile: async (
      _parent: any,
      { addressURN }: { addressURN: AddressURN },
      { env }: ResolverContext
    ) => {
      const addressClient = createAddressClient(env.Address, {
        [PlatformAddressURNHeader]: addressURN,
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
            [PlatformAddressURNHeader]: urn,
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
        [PlatformAddressURNHeader]: addressURN,
      })

      await addressClient.setNickname.query({
        nickname,
      })

      return true
    },
    updateConnectedAddressesProperties: async (
      _parent: any,
      { addressURNList },
      { env, jwt, accountURN }: ResolverContext
    ) => {
      const addressUrnEdges = addressURNList.map((a, i) => {
        // use the address urn space to construct a new urn with qcomps
        const parsed = AddressURNSpace.parse(a.addressURN).decoded
        const fullAddressURN = AddressURNSpace.componentizedUrn(
          parsed,
          undefined,
          {
            hidden: new Boolean(!!a.public).toString(),
            order: i.toString(),
          }
        )

        return {
          src: accountURN,
          dst: fullAddressURN,
          tag: EDGE_ADDRESS,
        }
      })

      // const edgesClient = createAddressClient(env.Edges, {

      return true
    },
  },

  AddressProfilesUnion: {
    __resolveType: (obj: AddressProfilesUnion) => {
      if ((obj as CryptoAddressProfile).isCrypto) {
        return 'CryptoAddressProfile'
      }
      if ((obj as OAuthGoogleProfile).isGoogle) {
        return 'OAuthGoogleProfile'
      }
      if ((obj as OAuthTwitterProfile).isTwitter) {
        return 'OAuthTwitterProfile'
      }
      if ((obj as OAuthGithubProfile).isGithub) {
        return 'OAuthGithubProfile'
      }
      if ((obj as OAuthMicrosoftProfile).isMicrosoft) {
        return 'OAuthMicrosoftProfile'
      }
      if ((obj as OAuthAppleProfile).isApple) {
        return 'OAuthAppleProfile'
      }
      if ((obj as unknown as OAuthDiscordProfile).isDiscord) {
        return 'OAuthDiscordProfile'
      }
      return null
    },
  },
}

// TODO: add address middleware
const AddressResolverComposition = {
  'Query.ensProfile': [requestLogging(), setupContext(), hasApiKey()],
  'Query.account': [requestLogging(), setupContext(), hasApiKey()],
  'Query.addressProfile': [requestLogging(), setupContext(), hasApiKey()],
  'Query.addressProfiles': [requestLogging(), setupContext(), hasApiKey()],
  'Mutation.updateAddressNickname': [
    requestLogging(),
    setupContext(),
    hasApiKey(),
    isAuthorized(),
  ],
  'Mutation.updateConnectedAddressesProperties': [
    requestLogging(),
    setupContext(),
    hasApiKey(),
    isAuthorized(),
  ],
}

export default composeResolvers(addressResolvers, AddressResolverComposition)
