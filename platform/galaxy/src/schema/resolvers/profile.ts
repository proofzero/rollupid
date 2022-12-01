import * as jose from 'jose'
import { composeResolvers } from '@graphql-tools/resolvers-composition'
import { parseURN } from 'urns'
import { WorkerApi as AccountApi } from '@kubelt/platform.account/src/types'
import {
  AddressURN,
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
  coreId?: string
  urn?: { service: string; name: string }
}

const threeIDResolvers: Resolvers = {
  Query: {
    profile: async (
      _parent: any,
      {},
      { env, jwt, coreId }: ResolverContext
    ) => {
      // console.log('query', coreId)
      // TODO: get coreId from URN

      console.log('getting...', { coreId })

      const accountClient = createFetcherJsonRpcClient<AccountApi>(env.Account)
      let accountProfile = await accountClient.kb_getProfile(coreId)

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
      const coreId = await addressClient.kb_resolveAccount()
      if (!coreId) {
        throw 'galaxy:profileFromAddress: no coreId found'
      }

      const accountClient = createFetcherJsonRpcClient<AccountApi>(env.Account)
      let accountProfile = await accountClient.kb_getProfile(coreId)

      // Upgrayedd Oort -> Account
      if (!accountProfile) {
        const oortClient = new OortClient(env.OORT)
        const parsedURN = parseURN(addressURN) // TODO: need utils lik AddressURN.parse(addressURN)
        const name = parsedURN.nss.split('/')[1]
        const oortResponse = await oortClient.getProfileFromAddress(name)
        accountProfile = await upgrayeddOortToAccount(
          coreId,
          accountClient,
          oortResponse
        )
        // TODO: also add address profile?
      }

      // console.log(accountProfile)
      return accountProfile
    },
  },
  Mutation: {
    updateThreeIDProfile: async (
      _parent: any,
      { profile },
      { env, jwt, coreId }: ResolverContext
    ) => {
      console.log('updating..')
      console.log({ coreId, profile })

      const accountClient = createFetcherJsonRpcClient<AccountApi>(env.Account)
      let currentProfile = await accountClient.kb_getProfile(coreId)

      // Make sure nulls are empty objects.
      currentProfile ||= {}

      const newProfile = {
        ...currentProfile,
        ...profile,
      }

      // TODO: Return the profile we've created. Need to enforce
      // the GraphQL types when setting data otherwise we're able
      // to set a value that can't be returned.
      await accountClient.kb_setProfile(coreId, newProfile)

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
