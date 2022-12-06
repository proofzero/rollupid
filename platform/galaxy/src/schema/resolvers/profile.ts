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

type ResolverContext = {
  env: Env
  jwt?: string
  accountURN?: string
}

const threeIDResolvers: Resolvers = {
  Query: {
    profile: async (
      _parent: any,
      {},
      { env, jwt, accountURN }: ResolverContext
    ) => {
      // console.log('query', coreId)
      // TODO: get coreId from URN

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
      { addressURN }: { addressURN: string },
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
      const accountURN = await addressClient.kb_resolveAccount()
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
        const AddressURN = createThreeIdURNSpace('address')
        const name = AddressURN.decode(
          addressURN as ThreeIdURN<'address/${name}'>
        )

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
