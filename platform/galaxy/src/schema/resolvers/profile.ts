import * as jose from 'jose'
import { composeResolvers } from '@graphql-tools/resolvers-composition'

import createAccountClient from '@kubelt/platform-clients/account'
import createAddressClient from '@kubelt/platform-clients/address'

import { setupContext, isAuthorized, hasApiKey } from './utils'

import Env from '../../env'
import { Resolvers } from './typedefs'
import { isCompositeType } from 'graphql'
import { GraphQLError } from 'graphql'
import { AccountURN } from '@kubelt/urns/account'
import { AddressURN, AddressURNSpace } from '@kubelt/urns/address'
import { PlatformJWTAssertionHeader } from '@kubelt/platform-middleware/jwt'
import { Profile } from '@kubelt/platform.account/src/jsonrpc/middlewares/profile'

type ResolverContext = {
  env: Env
  jwt: string
  apiKey: string
  accountURN: AccountURN
}

const profileResolvers: Resolvers = {
  Query: {
    profile: async (
      _parent: any,
      {},
      { env, accountURN, jwt }: ResolverContext
    ) => {
      console.log(`galaxy:profile: getting profile for account: ${accountURN}`)

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
      const addressClient = createAddressClient(env.Address, {
        headers: {
          'X-3RN': addressURN,
        },
      })
      const accountURN = await addressClient.resolveAccount.query()

      if (!accountURN) {
        console.log(
          'galaxy.profileFromAddress: attempt to resolve profile from address w/o account'
        )
        const errorMessage = `galaxy:profileFromAddress: no profile found for address ${addressURN}`
        try {
          const addressProfile = await addressClient.getAddressProfile.query()
          if (!addressProfile) {
            throw new GraphQLError(errorMessage)
          }
          return addressProfile
        } catch (e) {
          console.error(errorMessage)
          throw new GraphQLError(errorMessage)
        }
      }

      try {
        const accountClient = createAccountClient(env.Account, {
          headers: {
            [PlatformJWTAssertionHeader]: jwt,
          },
        })
        let accountProfile = await accountClient.getProfile.query({
          account: accountURN,
        })

        if (!accountProfile) {
          const addressProfile =
            (await addressClient.getAddressProfile.query()) as any
          accountProfile = {
            defaultAddress: addressProfile.address,
            displayName: addressProfile.displayName,
          }
        }

        return accountProfile
      } catch (e) {
        const errorMessage = `galaxy.profileFromAddress: failed to create profile for address ${addressURN}`
        console.error(errorMessage, e)
        throw new GraphQLError(errorMessage)
      }
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
  'Mutation.updateProfile': [setupContext(), hasApiKey(), isAuthorized()],
}

export default composeResolvers(profileResolvers, ProfileResolverComposition)
