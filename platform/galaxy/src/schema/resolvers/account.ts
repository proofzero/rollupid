import { composeResolvers } from '@graphql-tools/resolvers-composition'

import createAccountClient from '@kubelt/platform-clients/account'
import createAddressClient from '@kubelt/platform-clients/address'

import { setupContext, isAuthorized, hasApiKey, logAnalytics } from './utils'

import { Resolvers } from './typedefs'
import { GraphQLError } from 'graphql'
import { AddressURN, AddressURNSpace } from '@kubelt/urns/address'
import { Profile } from '@kubelt/platform.account/src/types'
import { ResolverContext } from './common'
import { PlatformJWTAssertionHeader } from '@kubelt/types/headers'

const accountResolvers: Resolvers = {
  Query: {
    profile: async (
      _parent: any,
      {},
      { env, accountURN, jwt }: ResolverContext
    ) => {
      console.log(`galaxy:profile: getting profile for account: ${accountURN}`)
      logAnalytics(
        env.Analytics,
        'profile',
        'query:gql',
        'BEFORE',
        accountURN,
        jwt
      )

      const accountClient = createAccountClient(env.Account, {
        headers: {
          [PlatformJWTAssertionHeader]: jwt,
        },
      })
      let accountProfile = await accountClient.getProfile.query({
        account: accountURN,
      })
      return accountProfile
    },
    profileFromAddress: async (
      _parent: any,
      { addressURN }: { addressURN: AddressURN },
      { env, jwt }: ResolverContext
    ) => {
      logAnalytics(
        env.Analytics,
        'profileFromAddress',
        'query:gql',
        'BEFORE',
        addressURN,
        jwt
      )
      const addressClient = createAddressClient(env.Address, {
        headers: {
          'X-3RN': addressURN, // note: ens names will be resolved
        },
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
      const accountClient = createAccountClient(env.Account, {
        headers: {
          [PlatformJWTAssertionHeader]: jwt,
        },
      })

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

      console.log('RETURN')

      return accountProfile
    },
    connectedAddresses: async (
      _parent: any,
      {},
      { env, accountURN, jwt }: ResolverContext
    ) => {
      logAnalytics(
        env.Analytics,
        'connectedAddresses',
        'query:gql',
        'BEFORE',
        accountURN,
        jwt
      )
      const accountClient = createAccountClient(env.Account, {
        headers: {
          [PlatformJWTAssertionHeader]: jwt,
        },
      })

      const addressesCall = jwt
        ? accountClient.getOwnAddresses
        : accountClient.getPublicAddresses

      const addresses = await addressesCall.query({
        account: accountURN,
      })

      return addresses
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
      logAnalytics(
        env.Analytics,
        'updateProfile',
        'mutation:gql',
        'BEFORE',
        accountURN,
        jwt
      )

      const accountClient = createAccountClient(env.Account, {
        headers: {
          [PlatformJWTAssertionHeader]: jwt,
        },
      })
      let currentProfile = await accountClient.getProfile.query({
        account: accountURN,
      })

      const newProfile = {
        ...currentProfile,
        ...profile,
      } as Profile

      // TODO: Return the profile we've created. Need to enforce
      // the GraphQL types when setting data otherwise we're able
      // to set a value that can't be returned.
      // TODO: handle and return form errors
      await accountClient.setProfile.mutate({
        name: accountURN,
        profile: newProfile,
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
  'Query.profile': [setupContext(), hasApiKey()],
  'Query.profileFromAddress': [setupContext(), hasApiKey()],
  'Query.connectedAddresses': [setupContext(), hasApiKey()],
  'Mutation.updateProfile': [setupContext(), hasApiKey(), isAuthorized()],
}

export default composeResolvers(accountResolvers, ProfileResolverComposition)
