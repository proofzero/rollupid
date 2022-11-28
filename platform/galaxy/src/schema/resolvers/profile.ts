import * as jose from 'jose'
import { composeResolvers } from '@graphql-tools/resolvers-composition'

import { WorkerApi as AccountApi } from '@kubelt/platform.account/src/types'
import { CryptoApi as AddressApi } from '@kubelt/platform.address/src/types'
import { createFetcherJsonRpcClient } from '@kubelt/platform.commons/src/jsonrpc'

import {
  setupContext,
  isAuthorized,
  checkHTTPStatus,
  getRPCResult,
  isEmptyObject,
  upgrayeddOortToAccount,
} from './utils'

import Env from '../../env'
import OortClient from './clients/oort'
import { Resolvers } from './typedefs'

type ResolverContext = {
  env: Env
  jwt?: string
  coreId?: string
}

const threeIDResolvers: Resolvers = {
  Query: {
    profile: async (_parent: any, {}, { env, jwt }: ResolverContext) => {
      // console.log('query', coreId)
      const coreId = jose.decodeJwt(jwt).iss

      const accountClient = createFetcherJsonRpcClient<AccountApi>(env.Account)
      let accountProfile = await accountClient.kb_getProfile(coreId)

      // Upgrayedd Oort -> Account
      if (isEmptyObject(accountProfile)) {
        const oortClient = new OortClient(env.Oort, jwt)
        const oortResponse = await oortClient.getProfile()
        accountProfile = await upgrayeddOortToAccount(
          coreId,
          accountClient,
          oortResponse
        )
      }

      // console.log(accountProfile)
      return accountProfile
    },
    profileFromAddress: async (
      _parent: any,
      { address }: { address: string },
      { env }: ResolverContext
    ) => {
      console.log('in resolver')
      const addressClient = createFetcherJsonRpcClient<AddressApi>(env.Address)
      const accountClient = createFetcherJsonRpcClient<AccountApi>(env.Account)

      const coreId = await addressClient.kb_resolveAddress(address)
      let accountProfile = await accountClient.kb_getProfile(coreId)

      // Upgrayedd Oort -> Account
      if (isEmptyObject(accountProfile)) {
        const oortClient = new OortClient(env.Oort)
        const oortResponse = await oortClient.getProfileFromAddress(address)
        accountProfile = await upgrayeddOortToAccount(
          coreId,
          accountClient,
          oortResponse
        )
      }

      // console.log(accountProfile)
      return accountProfile
    },
  },
  Mutation: {
    updateThreeIDProfile: async (
      _parent: any,
      { profile, visibility = 'PRIVATE' },
      { env, jwt, coreId }: ResolverContext
    ) => {
      // Rectify coreId in case it's undefined. Middleware should make sure JWT is valid here:
      coreId = coreId || jose.decodeJwt(jwt).iss

      const accountClient = createFetcherJsonRpcClient<AccountApi>(env.Account)
      let currentProfile = await accountClient.kb_getProfile(coreId)

      if (isEmptyObject(currentProfile)) {
        const oortClient = new OortClient(env.Oort, jwt)
        const oortResponse = await oortClient.getProfile()
        currentProfile = await checkHTTPStatus(oortResponse)
          .then(() => getRPCResult(oortResponse))
          .catch((e) => console.log(`Failed to get Oort profile`, e))
      }

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
  'Query.address': [setupContext()],
  'Query.addresses': [setupContext()],
  'Query.profile': [setupContext()],
  'Query.profileFromAddress': [setupContext()],
  'Mutation.updateThreeIDProfile': [setupContext()],
}

export default composeResolvers(threeIDResolvers, ThreeIDResolverComposition)
