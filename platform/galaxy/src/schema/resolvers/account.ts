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
  requestLogging,
  getAlchemyClients,
  getNftMetadataForAllChains,
} from './utils'

import { decorateNfts } from './utils/nfts'

import { NftProperty, Resolvers } from './typedefs'
import { GraphQLError } from 'graphql'
import { AddressURN, AddressURNSpace } from '@kubelt/urns/address'
import type {
  Gallery,
  GalleryItem,
  Links,
  Profile,
} from '@kubelt/platform.account/src/types'
import { ResolverContext } from './common'
import { PlatformAddressURNHeader } from '@kubelt/types/headers'
import { getAuthzHeaderConditionallyFromToken } from '@kubelt/utils'
import type { AccountURN } from '@kubelt/urns/account'
import {
  generateTraceContextHeaders,
  TraceSpan,
} from '@kubelt/packages/platform-middleware/trace'

const accountResolvers: Resolvers = {
  Query: {
    profile: async (
      _parent: any,
      { targetAccountURN }: { targetAccountURN?: AccountURN },
      { env, accountURN, jwt, traceSpan }: ResolverContext
    ) => {
      console.log(`galaxy:profile: getting profile for account: ${accountURN}`)

      const finalAccountURN = targetAccountURN || accountURN

      const accountClient = createAccountClient(env.Account, {
        ...getAuthzHeaderConditionallyFromToken(jwt),
        ...generateTraceContextHeaders(traceSpan),
      })

      let accountProfile = await accountClient.getProfile.query({
        account: finalAccountURN,
      })

      return accountProfile
    },

    authorizedApps: async (
      _parent: any,
      {},
      { env, accountURN, jwt, traceSpan }: ResolverContext
    ) => {
      const accountClient = createAccountClient(env.Account, {
        ...getAuthzHeaderConditionallyFromToken(jwt),
        ...generateTraceContextHeaders(traceSpan),
      })

      const apps = await accountClient.getAuthorizedApps.query({
        account: accountURN,
      })

      const starbaseClient = createStarbaseClient(env.Starbase, {
        ...getAuthzHeaderConditionallyFromToken(jwt),
        ...generateTraceContextHeaders(traceSpan),
      })

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
      { env, accountURN, jwt, traceSpan }: ResolverContext
    ) => {
      console.log(`galaxy:links: getting links for account: ${accountURN}`)

      const finalAccountURN = targetAccountURN || accountURN

      const accountClient = createAccountClient(env.Account, {
        ...getAuthzHeaderConditionallyFromToken(jwt),
        ...generateTraceContextHeaders(traceSpan),
      })
      let links = await accountClient.getLinks.query({
        account: finalAccountURN,
      })

      return links
    },

    gallery: async (
      _parent: any,
      { targetAccountURN }: { targetAccountURN?: AccountURN },
      { env, accountURN, jwt, traceSpan }: ResolverContext
    ) => {
      console.log(`galaxy:gallery: getting gallery for account: ${accountURN}`)

      const finalAccountURN = targetAccountURN || accountURN

      const accountClient = createAccountClient(env.Account, {
        ...getAuthzHeaderConditionallyFromToken(jwt),
        ...generateTraceContextHeaders(traceSpan),
      })

      const connectedAddresses = await getConnectedCryptoAddresses({
        accountURN: finalAccountURN,
        Account: env.Account,
        jwt: jwt,
        traceSpan,
      })

      let gallery = await accountClient.getGallery.query({
        account: finalAccountURN,
      })

      // -------- TEMPORARY MIGRATION PART START S-------------------------------

      if (gallery && !Object.keys(gallery[0]).includes('details')) {
        const alchemyClients = getAlchemyClients({ env })
        const input = gallery.map((nft) => ({
          contractAddress: nft.contract as string,
          chain: nft.chain as string,
          tokenId: nft.tokenId as string,
        }))

        const ownedNfts = await getNftMetadataForAllChains(
          input,
          alchemyClients,
          env
        )

        gallery = decorateNfts(ownedNfts) as GalleryItem[]

        const filteredGallery = (await validOwnership(
          gallery,
          env,
          connectedAddresses
        )) as GalleryItem[]

        /** MIGRATION
         * It'll be done only once for each user who's logging in profile app
         * and has gallery with old schema set up. Once done the "if" condition
         * on line 142 will return false and this code block won't run.
         */
        await accountClient.setGallery.mutate({
          name: accountURN,
          gallery: filteredGallery.map((nft) => {
            nft.properties = nft.properties?.map((prop: NftProperty | null) => {
              if (prop) {
                prop.value = prop.value.toString()
              }
              return prop
            })
            return nft
          }),
        })

        return filteredGallery
      }
      // -------- TEMPORARY MIGRATION PART END ---------------------------------
      if (gallery) {
        // Validation
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
      { env, accountURN, jwt, traceSpan }: ResolverContext
    ) => {
      const finalAccountURN = targetAccountURN || accountURN

      const addresses = await getConnectedAddresses({
        accountURN: finalAccountURN,
        Account: env.Account,
        jwt,
        traceSpan,
      })

      return addresses
    },
  },
  Mutation: {
    disconnectAddress: async (
      _parent: any,
      { addressURN }: { addressURN: AddressURN },
      { accountURN, env, jwt, traceSpan }: ResolverContext
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
        traceSpan,
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
        ...generateTraceContextHeaders(traceSpan),
      })

      await addressClient.unsetAccount.mutate(accountURN)

      return true
    },
    updateProfile: async (
      _parent: any,
      { profile },
      { env, jwt, accountURN, traceSpan }: ResolverContext
    ) => {
      console.log(
        `galaxy.updateProfile: updating profile for account: ${accountURN}`
      )

      const accountClient = createAccountClient(env.Account, {
        ...getAuthzHeaderConditionallyFromToken(jwt),
        ...generateTraceContextHeaders(traceSpan),
      })
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
      { env, jwt, accountURN, traceSpan }: ResolverContext
    ) => {
      console.log(
        `galaxy.updateProfile: updating profile for account: ${accountURN}`
      )

      const accountClient = createAccountClient(env.Account, {
        ...getAuthzHeaderConditionallyFromToken(jwt),
        ...generateTraceContextHeaders(traceSpan),
      })

      await accountClient.setLinks.mutate({
        name: accountURN,
        links,
      })
      return true
    },

    updateGallery: async (
      _parent: any,
      { gallery }: { gallery: Gallery },
      { env, jwt, accountURN, traceSpan }: ResolverContext
    ) => {
      console.log(
        `galaxy.updateGallery: updating gallery for account: ${accountURN}`
      )

      const accountClient = createAccountClient(env.Account, {
        ...getAuthzHeaderConditionallyFromToken(jwt),
        ...generateTraceContextHeaders(traceSpan),
      })

      const connectedAddresses = await getConnectedCryptoAddresses({
        accountURN,
        Account: env.Account,
        jwt,
        traceSpan,
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
  'Query.profile': [
    requestLogging(),
    setupContext(),
    hasApiKey(),
    logAnalytics(),
  ],
  'Query.authorizedApps': [
    requestLogging(),
    setupContext(),
    hasApiKey(),
    logAnalytics(),
  ],
  'Query.links': [
    requestLogging(),
    setupContext(),
    hasApiKey(),
    logAnalytics(),
  ],
  'Query.gallery': [
    requestLogging(),
    setupContext(),
    hasApiKey(),
    logAnalytics(),
  ],
  'Query.connectedAddresses': [
    requestLogging(),
    setupContext(),
    hasApiKey(),
    logAnalytics(),
    temporaryConvertToPublic(),
  ],
  'Mutation.updateProfile': [
    requestLogging(),
    setupContext(),
    hasApiKey(),
    isAuthorized(),
    logAnalytics(),
  ],
  'Mutation.updateLinks': [
    requestLogging(),
    setupContext(),
    hasApiKey(),
    isAuthorized(),
    logAnalytics(),
  ],
  'Mutation.updateGallery': [
    requestLogging(),
    setupContext(),
    hasApiKey(),
    isAuthorized(),
    logAnalytics(),
  ],
  'Mutation.disconnectAddress': [
    requestLogging(),
    setupContext(),
    hasApiKey(),
    isAuthorized(),
    logAnalytics(),
  ],
}

export default composeResolvers(accountResolvers, ProfileResolverComposition)
