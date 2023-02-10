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
  getAlchemyClients,
  temporaryConvertToPublic,
} from './utils'

import { Resolvers } from './typedefs'
import { GraphQLError } from 'graphql'
import { AddressURN, AddressURNSpace } from '@kubelt/urns/address'
import { NodeType } from '@kubelt/types/address'
import { Gallery, Links, Profile } from '@kubelt/platform.account/src/types'
import { ResolverContext } from './common'
import { PlatformAddressURNHeader } from '@kubelt/types/headers'
import { getAuthzHeaderConditionallyFromToken } from '@kubelt/utils'

const accountResolvers: Resolvers = {
  Query: {
    profile: async (
      _parent: any,
      {},
      { env, accountURN, jwt }: ResolverContext
    ) => {
      console.log(`galaxy:profile: getting profile for account: ${accountURN}`)
      const accountClient = createAccountClient(
        env.Account,
        getAuthzHeaderConditionallyFromToken(jwt)
      )
      let accountProfile = await accountClient.getProfile.query({
        account: accountURN,
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
            icon: iconURL,
            title: name,
            timestamp: a.timestamp,
          }
        })
      )

      return mappedApps
    },

    //@ts-ignore
    links: async (
      _parent: any,
      {},
      { env, accountURN, jwt }: ResolverContext
    ) => {
      console.log(`galaxy:links: getting links for account: ${accountURN}`)
      const accountClient = createAccountClient(
        env.Account,
        getAuthzHeaderConditionallyFromToken(jwt)
      )
      let links = await accountClient.getLinks.query({
        account: accountURN,
      })

      return links
    },

    gallery: async (
      _parent: any,
      {},
      { env, accountURN, jwt }: ResolverContext
    ) => {
      console.log(`galaxy:gallery: getting gallery for account: ${accountURN}`)
      const accountClient = createAccountClient(
        env.Account,
        getAuthzHeaderConditionallyFromToken(jwt)
      )

      let gallery = await accountClient.getGallery.query({
        account: accountURN,
      })

      return gallery
    },

    connectedAddresses: async (
      _parent: any,
      {},
      { env, accountURN, jwt }: ResolverContext
    ) => {
      const addresses = getConnectedAddresses({
        accountURN,
        Account: env.Account,
        jwt,
      })

      return addresses
    },

    profileFromAddress: async (
      _parent: any,
      { addressURN }: { addressURN: AddressURN },
      { env, jwt }: ResolverContext
    ) => {
      const addressClient = createAddressClient(env.Address, {
        [PlatformAddressURNHeader]: addressURN, // note: ens names will be resolved
      })
      const accountURN = await addressClient.getAccount.query()

      // return the address profile if no account is associated with the address
      if (!accountURN) {
        console.log(
          'galaxy.profileFromAddress: attempt to resolve profile from address w/o account'
        )
        throw new GraphQLError("Address doesn't have an associated account")
      }

      // get the account profile
      const accountClient = createAccountClient(
        env.Account,
        getAuthzHeaderConditionallyFromToken(jwt)
      )

      console.log("galaxy.profileFromAddress: getting account's profile")
      // should also return the handle if it exists
      let accountProfile = await accountClient.getProfile.query({
        account: accountURN,
      })

      const baseUrn = AddressURNSpace.urn(
        AddressURNSpace.parse(addressURN).decoded
      )

      // check if the addressURN is in the account's connected addresses (if hidden it won't be)
      if (
        accountProfile &&
        !accountProfile.addresses.filter((address) => baseUrn === address.urn)
          .length
      ) {
        console.log('galaxy.profileFromAddress: address is hidden')
        throw new GraphQLError("Address doesn't have an associated account", {
          extensions: {
            code: 'Address not found',
            http: {
              status: 404,
            },
          },
        })
      }

      return accountProfile
    },

    linksFromAddress: async (
      _parent: any,
      { addressURN }: { addressURN: AddressURN },
      { env, jwt }: ResolverContext
    ) => {
      const addressClient = createAddressClient(env.Address, {
        [PlatformAddressURNHeader]: addressURN, // note: ens names will be resolved
      })
      const accountURN = await addressClient.getAccount.query()

      // return the address profile if no account is associated with the address
      if (!accountURN) {
        console.log(
          'galaxy.linksFromAddress: attempt to resolve profile from address w/o account'
        )
        throw new GraphQLError("Address doesn't have an associated account")
      }

      // get the account profile
      const accountClient = createAccountClient(
        env.Account,
        getAuthzHeaderConditionallyFromToken(jwt)
      )

      console.log("galaxy.linksFromAddress: getting account's links")
      // should also return the handle if it exists
      const linksFromAddress = await accountClient.getLinks.query({
        account: accountURN,
      })

      return linksFromAddress
    },

    galleryFromAddress: async (
      _parent: any,
      { addressURN }: { addressURN: AddressURN },
      { env, jwt }: ResolverContext
    ) => {
      const addressClient = createAddressClient(env.Address, {
        [PlatformAddressURNHeader]: addressURN, // note: ens names will be resolved
      })
      const accountURN = await addressClient.getAccount.query()

      // return the address profile if no account is associated with the address
      if (!accountURN) {
        console.log(
          'galaxy.galleryFromAddress: attempt to resolve profile from address w/o account'
        )
        throw new GraphQLError("Address doesn't have an associated account")
      }

      // get the account profile
      const accountClient = createAccountClient(
        env.Account,
        getAuthzHeaderConditionallyFromToken(jwt)
      )

      console.log("galaxy.galleryFromAddress: getting account's gallery")
      // should also return the handle if it exists
      const galleryFromAddress = await accountClient.getGallery.query({
        account: accountURN,
      })

      return galleryFromAddress
    },

    connectedAddressesFromAddress: async (
      _parent: any,
      { addressURN }: { addressURN: AddressURN },
      { env, jwt }: ResolverContext
    ) => {
      const addressClient = createAddressClient(env.Address, {
        [PlatformAddressURNHeader]: addressURN, // note: ens names will be resolved
      })
      const accountURN = await addressClient.getAccount.query()

      // return the address profile if no account is associated with the address
      if (!accountURN) {
        console.log(
          'galaxy.connectedAddressesFromAddress: attempt to resolve profile from address w/o account'
        )
        throw new GraphQLError("Address doesn't have an associated account")
      }

      console.log(
        "galaxy.connectedAddressesFromAddress: getting account's connected addresses"
      )
      // should also return the handle if it exists
      const connectedAddressesFromAddress = getConnectedAddresses({
        accountURN,
        Account: env.Account,
        jwt,
      })

      return connectedAddressesFromAddress
    },
  },
  Mutation: {
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
    //@ts-ignore
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
    //@ts-ignore
    updateGallery: async (
      _parent: any,
      { gallery }: { gallery: Gallery },
      { env, jwt, accountURN }: ResolverContext
    ) => {
      console.log(
        `galaxy.updateProfile: updating profile for account: ${accountURN}`
      )

      const accountClient = createAccountClient(
        env.Account,
        getAuthzHeaderConditionallyFromToken(jwt)
      )

      const connectedAddresses = (
        (await getConnectedAddresses({
          accountURN,
          Account: env.Account,
          jwt,
        })) || []
      )
        .filter((address) =>
          [NodeType.Crypto, NodeType.Vault].includes(address.rc.node_type)
        )
        .map((address) => address.qc.alias.toLowerCase())

      // GALLERY VALIDATION
      const { ethereumClient, polygonClient } = getAlchemyClients({ env })

      const owners: any = await Promise.all(
        gallery.map(async (token) => {
          const [ethereumOwners, polygonOwners]: any = await Promise.all([
            ethereumClient.getOwnersForToken({
              tokenId: token.tokenId,
              contractAddress: token.contract,
            }),
            polygonClient.getOwnersForToken({
              tokenId: token.tokenId,
              contractAddress: token.contract,
            }),
          ])
          return ethereumOwners.owners.concat(polygonOwners.owners)
        })
      )

      gallery = gallery.filter((nft, i) => {
        return connectedAddresses.some((address) => {
          return owners[i].includes(address)
        })
      })

      await accountClient.setGallery.mutate({
        name: accountURN,
        gallery,
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
  'Query.profileFromAddress': [setupContext(), hasApiKey(), logAnalytics()],
  'Query.linksFromAddress': [setupContext(), hasApiKey(), logAnalytics()],
  'Query.galleryFromAddress': [setupContext(), hasApiKey(), logAnalytics()],
  'Query.connectedAddressesFromAddress': [
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
}

export default composeResolvers(accountResolvers, ProfileResolverComposition)
