import { composeResolvers } from '@graphql-tools/resolvers-composition'

import createAccountClient from '@kubelt/platform-clients/account'
import createAddressClient from '@kubelt/platform-clients/address'
import createStarbaseClient from '@kubelt/platform-clients/starbase'

import {
  setupContext,
  isAuthorized,
  hasApiKey,
  logAnalytics,
  getConnectedAddresses,
  getConnectedCryptoAddresses,
  temporaryConvertToPublic,
  validOwnership,
} from './utils'

import { Resolvers } from './typedefs'
import { GraphQLError } from 'graphql'
import { AddressURN, AddressURNSpace } from '@kubelt/urns/address'
import { Gallery, Links, Profile } from '@kubelt/platform.account/src/types'
import { ResolverContext } from './common'
import { PlatformAddressURNHeader } from '@kubelt/types/headers'
import { getAuthzHeaderConditionallyFromToken } from '@kubelt/utils'
import type { AccountURN } from '@kubelt/urns/account'

const accountResolvers: Resolvers = {
  Query: {
    profile: async (
      _parent: any,
      { targetAccountURN }: { targetAccountURN?: AccountURN },
      { env, accountURN, jwt }: ResolverContext
    ) => {
      console.log(`galaxy:profile: getting profile for account: ${accountURN}`)

      const finalAccountURN = targetAccountURN || accountURN

      const accountClient = createAccountClient(
        env.Account,
        getAuthzHeaderConditionallyFromToken(jwt)
      )

      let accountProfile = await accountClient.getProfile.query({
        account: finalAccountURN,
      })

      return accountProfile
    },

    authorizedApps: async (
      _parent: any,
      {},
      { env, accountURN, jwt }: ResolverContext
    ) => {
      const accountClient = createAccountClient(
        env.Account,
        getAuthzHeaderConditionallyFromToken(jwt)
      )

      const apps = await accountClient.getAuthorizedApps.query({
        account: accountURN,
      })

      const starbaseClient = createStarbaseClient(
        env.Starbase,
        getAuthzHeaderConditionallyFromToken(jwt)
      )

      const mappedApps = await Promise.all(
        apps.map(async (a) => {
          const { name, iconURL } =
            await starbaseClient.getAppPublicProps.query({
              clientId: a.clientId,
            })

          return {
            clientId: a.clientId,
            icon: iconURL,
            title: name,
            timestamp: a.timestamp,
          }
        })
      )

      return mappedApps
    },

    links: async (
      _parent: any,
      { targetAccountURN }: { targetAccountURN?: AccountURN },
      { env, accountURN, jwt }: ResolverContext
    ) => {
      console.log(`galaxy:links: getting links for account: ${accountURN}`)

      const finalAccountURN = targetAccountURN || accountURN

      const accountClient = createAccountClient(
        env.Account,
        getAuthzHeaderConditionallyFromToken(jwt)
      )
      let links = await accountClient.getLinks.query({
        account: finalAccountURN,
      })

      return links
    },

    gallery: async (
      _parent: any,
      { targetAccountURN }: { targetAccountURN?: AccountURN },
      { env, accountURN, jwt }: ResolverContext
    ) => {
      console.log(`galaxy:gallery: getting gallery for account: ${accountURN}`)

      const finalAccountURN = targetAccountURN || accountURN

      const accountClient = createAccountClient(
        env.Account,
        getAuthzHeaderConditionallyFromToken(jwt)
      )

      const connectedAddresses = await getConnectedCryptoAddresses({
        accountURN: finalAccountURN,
        Account: env.Account,
        jwt: jwt,
      })

      const gallery = await accountClient.getGallery.query({
        account: finalAccountURN,
      })

      // Validation
      if (gallery) {
        const filteredGallery = await validOwnership(
          gallery,
          env,
          connectedAddresses
        )
        // Removal
        if (gallery.length !== filteredGallery.length) {
          accountClient.setGallery.mutate({
            name: finalAccountURN,
            gallery: filteredGallery,
          })
        }

        return filteredGallery
      }
      // if there is no gallery
      return []
    },

    connectedAddresses: async (
      _parent: any,
      { targetAccountURN }: { targetAccountURN?: AccountURN },
      { env, accountURN, jwt }: ResolverContext
    ) => {
      const finalAccountURN = targetAccountURN || accountURN

      const addresses = await getConnectedAddresses({
        accountURN: finalAccountURN,
        Account: env.Account,
        jwt,
      })

      return addresses
    },
  },
  Mutation: {
    disconnectAddress: async (
      _parent: any,
      { addressURN }: { addressURN: AddressURN },
      { accountURN, env, jwt }: ResolverContext
    ) => {
      if (!AddressURNSpace.is(addressURN)) {
        throw new GraphQLError(
          'Invalid addressURN format. Base address URN expected.'
        )
      }

      const addresses = await getConnectedAddresses({
        accountURN,
        Account: env.Account,
        jwt,
      })

      const addressURNList = addresses?.map((a) => a.baseUrn) ?? []
      if (!addressURNList.includes(addressURN)) {
        throw new GraphQLError('Calling account is not address owner')
      }

      if (addressURNList.length === 1) {
        throw new GraphQLError('Cannot disconnect last address')
      }

      const addressClient = createAddressClient(env.Address, {
        [PlatformAddressURNHeader]: addressURN,
      })

      await addressClient.unsetAccount.mutate(accountURN)

      return true
    },
    updateProfile: async (
      _parent: any,
      { profile },
      { env, jwt, accountURN }: ResolverContext
    ) => {
      console.log(
        `galaxy.updateProfile: updating profile for account: ${accountURN}`
      )

      const accountClient = createAccountClient(
        env.Account,
        getAuthzHeaderConditionallyFromToken(jwt)
      )
      let currentProfile = await accountClient.getProfile.query({
        account: accountURN,
      })

      const newProfile = {
        ...currentProfile,
        ...profile,
      } as Profile

      await accountClient.setProfile.mutate({
        name: accountURN,
        profile: newProfile,
      })
      return true
    },

    updateLinks: async (
      _parent: any,
      { links }: { links: Links },
      { env, jwt, accountURN }: ResolverContext
    ) => {
      console.log(
        `galaxy.updateProfile: updating profile for account: ${accountURN}`
      )

      const accountClient = createAccountClient(
        env.Account,
        getAuthzHeaderConditionallyFromToken(jwt)
      )

      await accountClient.setLinks.mutate({
        name: accountURN,
        links,
      })
      return true
    },

    updateGallery: async (
      _parent: any,
      { gallery }: { gallery: Gallery },
      { env, jwt, accountURN }: ResolverContext
    ) => {
      console.log(
        `galaxy.updateGallery: updating gallery for account: ${accountURN}`
      )

      const accountClient = createAccountClient(
        env.Account,
        getAuthzHeaderConditionallyFromToken(jwt)
      )

      const connectedAddresses = await getConnectedCryptoAddresses({
        accountURN,
        Account: env.Account,
        jwt,
      })

      // Validation
      const filteredGallery = await validOwnership(
        gallery,
        env,
        connectedAddresses
      )

      await accountClient.setGallery.mutate({
        name: accountURN,
        gallery: filteredGallery,
      })

      return true
    },
  },
  PFP: {
    __resolveType: (obj: any) => {
      if (obj.isToken) {
        return 'NFTPFP'
      }
      return 'StandardPFP'
    },
  },
}

const ProfileResolverComposition = {
  'Query.profile': [setupContext(), hasApiKey(), logAnalytics()],
  'Query.authorizedApps': [setupContext(), hasApiKey(), logAnalytics()],
  'Query.links': [setupContext(), hasApiKey(), logAnalytics()],
  'Query.gallery': [setupContext(), hasApiKey(), logAnalytics()],
  'Query.connectedAddresses': [
    setupContext(),
    hasApiKey(),
    logAnalytics(),
    temporaryConvertToPublic(),
  ],
  'Mutation.updateProfile': [
    setupContext(),
    hasApiKey(),
    isAuthorized(),
    logAnalytics(),
  ],
  'Mutation.updateLinks': [
    setupContext(),
    hasApiKey(),
    isAuthorized(),
    logAnalytics(),
  ],
  'Mutation.updateGallery': [
    setupContext(),
    hasApiKey(),
    isAuthorized(),
    logAnalytics(),
  ],
  'Mutation.disconnectAddress': [
    setupContext(),
    hasApiKey(),
    isAuthorized(),
    logAnalytics(),
  ],
}

export default composeResolvers(accountResolvers, ProfileResolverComposition)
