import { composeResolvers } from '@graphql-tools/resolvers-composition'

import createAccountClient from '@kubelt/platform-clients/account'
import createAddressClient from '@kubelt/platform-clients/address'

import { setupContext, isAuthorized, hasApiKey } from './utils'

import Env from '../../env'
import { Resolvers } from './typedefs'
import { GraphQLError } from 'graphql'
import { AccountURN } from '@kubelt/urns/account'
import { AddressURN } from '@kubelt/urns/address'
import { PlatformJWTAssertionHeader } from '@kubelt/platform-middleware/jwt'
import { Profile } from '@kubelt/platform.account/src/types'
import { CryptoAddressProfile } from '../../../../address/src/types'

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
      console.log('form Profile', accountProfile)
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
      console.log('From resolver', addressURN)
      const accountURN = await addressClient.getAccount.query()

      // return the address profile if no account is associated with the address
      if (!accountURN) {
        console.log(
          'galaxy.profileFromAddress: attempt to resolve profile from address w/o account'
        )
        const errorMessage = `galaxy:profileFromAddress: no profile found for address ${addressURN}`
        try {
          const [addressProfile, voucher] = await Promise.all([
            addressClient.getAddressProfile.query(),
            addressClient.getVoucher.query(), // TODO: should only get if we know this is a crypto address
          ])

          if (!addressProfile) {
            throw new GraphQLError(errorMessage)
          }
          // NOTE: the above case is needs to change when social vault accounts hooked up
          // We will need to call for addresses and then get the profile?
          // Or have utility to manage the mapping?
          const cryptoAddressProfile = addressProfile as CryptoAddressProfile
          console.log(
            'galaxy.profileFromAddress: returning address profile',
            cryptoAddressProfile
          )
          return {
            displayName: cryptoAddressProfile.displayName,
            pfp: {
              image: cryptoAddressProfile.avatar as string,
            },
            cover: voucher.metadata.cover,
            defaultAddress: addressURN,
          }
        } catch (e) {
          console.error(errorMessage)
          throw new GraphQLError(errorMessage)
        }
      }

      // get the account profile
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
    connectedAddresses: async (
      _parent: any,
      { addressURN }: { addressURN: AddressURN },
      { env, jwt }: ResolverContext
    ) => {
      const addressClient = createAddressClient(env.Address, {
        headers: {
          'X-3RN': addressURN,
        },
      })

      const addressUrns = [addressURN]

      const accountURN = await addressClient.getAccount.query()
      if (!accountURN) {
        // If there is no account URN
        // it's assumed that this is the only
        // 'connected' address
        return addressUrns
      }

      const accountClient = createAccountClient(env.Account, {
        headers: {
          [PlatformJWTAssertionHeader]: jwt,
        },
      })

      const connectedAccounts = await accountClient.getAddresses.query({
        account: accountURN,
      })

      return addressUrns.concat(connectedAccounts)
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
  'Query.connectedAddresses': [setupContext(), hasApiKey()],
  'Mutation.updateProfile': [setupContext(), hasApiKey(), isAuthorized()],
}

export default composeResolvers(profileResolvers, ProfileResolverComposition)
