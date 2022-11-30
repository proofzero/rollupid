import * as jose from 'jose'
import { composeResolvers } from '@graphql-tools/resolvers-composition'

import { WorkerApi as AccountApi } from '@kubelt/platform.account/src/types'
import { WorkerApi as AddressApi } from '@kubelt/platform.address/src/types'
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

type ResolverContext = {
  env: Env
  jwt?: string
  coreId?: string
}

const threeIDResolvers: Resolvers = {
  Query: {
    profile: async (_parent: any, {}, { env, jwt }: ResolverContext) => {
      // console.log('query', coreId)
      // TODO: get coreId from URN
      const coreId = jose.decodeJwt(jwt).sub

      const accountClient = createFetcherJsonRpcClient<AccountApi>(env.Account)
      let accountProfile = await accountClient.kb_getProfile(coreId)

      // console.log(accountProfile)
      return accountProfile
    },
    profileFromAddress: async (
      _parent: any,
      {
        address,
        nodeType,
        addrType,
      }: { address: string; nodeType: string; addrType: string },
      { env }: ResolverContext
    ) => {
      const addressClient = createFetcherJsonRpcClient<AddressApi>(
        env.Address,
        {
          headers: {
            'X-3RN': AddressURNSpace.fullUrn(`address/${address}`, { q: { node_type, addr_type }}),
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
        const oortResponse = await oortClient.getProfileFromAddress(address)
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
      // Rectify coreId in case it's undefined. Middleware should make sure JWT is valid here:
      coreId = (coreId || jose.decodeJwt(jwt).sub) as string

      console.log({ coreId })

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
  'Query.address': [setupContext()],
  'Query.addresses': [setupContext()],
  'Query.profile': [setupContext()],
  'Query.profileFromAddress': [setupContext()],
  'Mutation.updateThreeIDProfile': [setupContext(), isAuthorized()],
}

export default composeResolvers(threeIDResolvers, ThreeIDResolverComposition)
