import { composeResolvers } from '@graphql-tools/resolvers-composition'
import ENSUtils from '@kubelt/platform-clients/ens-utils'
import createAddressClient from '@kubelt/platform-clients/address'
import { AddressURN, AddressURNSpace } from '@kubelt/urns/address'

import { AddressProfilesUnion, Resolvers } from './typedefs'
import {
  validateApiKey,
  setupContext,
  isAuthorized,
  requestLogging,
} from './utils'

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
import { generateTraceContextHeaders } from '@kubelt/platform-middleware/trace'

const addressResolvers: Resolvers = {
  Query: {
    accountFromEns: async (
      _parent,
      { ens }: { ens: string },
      { env, traceSpan }: ResolverContext
    ) => {
      const address = (await new ENSUtils().getEnsEntry(ens)).address
      const addressClient = createAddressClient(env.Address, {
        ...generateTraceContextHeaders(traceSpan),
      })
      const accountURN = await addressClient.getAccountByAlias.query({
        alias: address,
        provider: 'eth',
      })

      return accountURN
    },
    accountFromAlias: async (
      _parent,
      { provider, alias }: { provider: string; alias: string },
      { env, traceSpan }: ResolverContext
    ) => {
      const addressClient = createAddressClient(env.Address, {
        ...generateTraceContextHeaders(traceSpan),
      })
      const accountURN = await addressClient.getAccountByAlias.query({
        alias,
        provider,
      })

      return accountURN
    },
    addressProfile: async (
      _parent: any,
      { addressURN }: { addressURN: AddressURN },
      { env, traceSpan }: ResolverContext
    ) => {
      const addressClient = createAddressClient(env.Address, {
        [PlatformAddressURNHeader]: addressURN,
        ...generateTraceContextHeaders(traceSpan),
      })

      const addressProfile = await addressClient.getAddressProfile.query()

      return addressProfile
    },

    addressProfiles: async (
      _parent: any,
      { addressURNList }: { addressURNList: AddressURN[] },
      { env, traceSpan }: ResolverContext
    ) => {
      const profiles = await Promise.all(
        addressURNList.map(async (urn) => {
          const addressClient = createAddressClient(env.Address, {
            [PlatformAddressURNHeader]: urn,
            ...generateTraceContextHeaders(traceSpan),
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
      { env, traceSpan }: ResolverContext
    ) => {
      const addressClient = createAddressClient(env.Address, {
        [PlatformAddressURNHeader]: addressURN,
        ...generateTraceContextHeaders(traceSpan),
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
  'Query.accountFromEns': [requestLogging(), setupContext(), validateApiKey()],
  'Query.account': [requestLogging(), setupContext(), validateApiKey()],
  'Query.addressProfile': [requestLogging(), setupContext(), validateApiKey()],
  'Query.addressProfiles': [requestLogging(), setupContext(), validateApiKey()],
  'Mutation.updateAddressNickname': [
    requestLogging(),
    setupContext(),
    validateApiKey(),
    isAuthorized(),
  ],
  'Mutation.updateConnectedAddressesProperties': [
    requestLogging(),
    setupContext(),
    validateApiKey(),
    isAuthorized(),
  ],
}

export default composeResolvers(addressResolvers, AddressResolverComposition)
