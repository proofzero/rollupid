import * as jose from 'jose'
import { composeResolvers } from '@graphql-tools/resolvers-composition'
import { WorkerApi as AccountApi } from '@kubelt/platform.account/src/types'
import {
  createThreeIdURNSpace,
  ThreeIdURN,
  ThreeIdURNSpace,
} from '@kubelt/urns'
import {
  CryptoWorkerApi,
  WorkerApi as AddressApi,
} from '@kubelt/platform.address/src/types'
import { createFetcherJsonRpcClient } from '@kubelt/platform.commons/src/jsonrpc'

import {
  setupContext,
  isAuthorized,
  checkHTTPStatus,
  getRPCResult,
  upgrayeddOortToAccount,
} from './utils'

import Env from '../../env'
import OortClient from './clients/oort'
import { Resolvers } from './typedefs'
import { isCompositeType } from 'graphql'
import { GraphQLError } from 'graphql'
import { AccountURN } from '@kubelt/urns/account'
import { AddressURN, AddressURNSpace } from '@kubelt/urns/address'

type ResolverContext = {
  env: Env
  jwt: string
  accountURN: AccountURN
}

const threeIDResolvers: Resolvers = {
  Query: {
    profile: async (_parent: any, {}, { env, accountURN }: ResolverContext) => {
      console.log(
        `galaxy:profileFromAddress: getting profile for account: ${accountURN}`
      )

      const accountClient = createFetcherJsonRpcClient<AccountApi>(env.Account)
      let accountProfile = await accountClient.kb_getProfile(accountURN)

      // console.log(accountProfile)
      return accountProfile
    },
    profileFromAddress: async (
      _parent: any,
      { addressURN }: { addressURN: AddressURN },
      { env }: ResolverContext
    ) => {
      const addressClient = createFetcherJsonRpcClient<AddressApi>(
        env.Address,
        {
          headers: {
            'X-3RN': addressURN,
          },
        }
      )
      const accountURN = await addressClient.kb_getAccount()
      if (!accountURN) {
        console.log(
          'galaxy.profileFromAddress: attempt to resolve profile from address w/o account'
        )
        const errorMessage = `galaxy:profileFromAddress: no profile found for address ${addressURN}`
        try {
          const addressProfile = await (addressClient as CryptoWorkerApi) // TODO: should there be generic addres profile interface?
            .kb_getAddressProfile()
          if (!addressProfile) {
            throw errorMessage
          }
          return addressProfile
        } catch (e) {
          console.error(
            'galaxy.profileFromAddress: failed to upgrayed from oort:',
            { errorMessage }
          )
          throw errorMessage
        }
      }

      const accountClient = createFetcherJsonRpcClient<AccountApi>(env.Account)
      let accountProfile = await accountClient.kb_getProfile(accountURN)

      console.log({ accountProfile })
      // Upgrayedd Oort -> Account
      if (!accountProfile) {
        console.log(
          `galaxy:profileFromAddress: upgrayedd Oort -> Account for ${addressURN}`
        )
        const oortClient = new OortClient(env.Oort)
        const name = AddressURNSpace.decode(addressURN)

        try {
          const oortResponse = await oortClient.getProfileFromAddress(name)
          accountProfile = await upgrayeddOortToAccount(
            accountURN,
            name,
            accountClient,
            oortResponse
          )
        } catch (err) {
          console.error(
            'galaxy.profileFromAddress: failed to upgrayed from oort:',
            { err }
          )
          accountProfile = {}
        }
      }

      // console.log(accountProfile)
      return accountProfile
    },
  },
  Mutation: {
    updateThreeIDProfile: async (
      _parent: any,
      { profile },
      { env, jwt, accountURN }: ResolverContext
    ) => {
      console.log(
        `galaxy.profileFromAddress: updating profile for account: ${accountURN}`
      )

      const accountClient = createFetcherJsonRpcClient<AccountApi>(env.Account)
      let currentProfile = await accountClient.kb_getProfile(accountURN)

      // Make sure nulls are empty objects.
      currentProfile ||= {}

      const newProfile = {
        ...currentProfile,
        ...profile,
      }

      // TODO: Return the profile we've created. Need to enforce
      // the GraphQL types when setting data otherwise we're able
      // to set a value that can't be returned.
      await accountClient.kb_setProfile(accountURN, newProfile)

      return true
    },
  },
  Profile: {
    __resolveType: (obj: any) => {
      if (obj.pfp) {
        // TODO: what makes a ThreeIDProfile unique from others?
        return 'ThreeIDProfile'
      }
      return 'DefaultProfile'
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

const ThreeIDResolverComposition = {
  'Query.profile': [setupContext()],
  'Query.profileFromAddress': [setupContext()],
  'Mutation.updateThreeIDProfile': [setupContext(), isAuthorized()],
}

export default composeResolvers(threeIDResolvers, ThreeIDResolverComposition)
