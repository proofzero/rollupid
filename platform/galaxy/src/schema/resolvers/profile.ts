import { composeResolvers } from '@graphql-tools/resolvers-composition'
import { getDefaultProvider, AlchemyProvider } from '@ethersproject/providers'

import Env from '../../env'
import OortClient from './clients/oort'

import { WorkerApi as AccountApi } from '@kubelt/platform.account/src/types'
import { WorkerApi as AddressApi } from '@kubelt/platform.address/src/types'
import { HEADER_CORE_ADDRESS } from '@kubelt/platform.commons/src/constants'
import { createFetcherJsonRpcClient } from '@kubelt/platform.commons/src/jsonrpc'

import {
  setupContext,
  isAuthorized,
  checkHTTPStatus,
  getRPCResult,
  isEmptyObject,
} from './utils'

import { Resolvers } from './typedefs'
import { GraphQLYogaError } from '@graphql-yoga/common'
import profile from '../types/profile'

type ResolverContext = {
  env: Env
  jwt?: string
  coreId?: string
}

const threeIDResolvers: Resolvers = {
  Query: {
    profile: async (_parent: any, {}, { env, jwt }: ResolverContext) => {
      const oortClient = new OortClient(env.OORT, jwt)
      const profileResponse = await oortClient.getProfile()
      await checkHTTPStatus(profileResponse)
      const res = getRPCResult(profileResponse)
      return await res
    },
    profileFromAddress: async (
      _parent: any,
      { address }: { address: string },
      { env }: ResolverContext
    ) => {
      const addressClient = createFetcherJsonRpcClient<AddressApi>(env.Address)
      const coreId = await addressClient.kb_resolveAddress(address)

      const accountClient = createFetcherJsonRpcClient<AccountApi>(env.Account)
      const oortClient = new OortClient(env.OORT)

      // Migration logic:
      // If there's an account profile, we're done.
      // If there's not an account profile, check Oort.
      // If there's an Oort profile, set it as the account profile and return.
      // If there's no Oort profile and no Account profile, there's no profile. Return null.
              
      let accountProfile = await accountClient.kb_getProfile(coreId)
      console.log(accountProfile)

      if (isEmptyObject(accountProfile)) {
        accountProfile = await oortClient.getProfileFromAddress(address)
        console.log(accountProfile)
      }

      // console.log('here1')

      // if (isEmptyObject(accountProfile)) return accountProfile

      // console.log('here2')

      await checkHTTPStatus(accountProfile)

      const [result, _] = await getRPCResult(accountProfile)
        .then(async r => [r, await accountClient.kb_setProfile(coreId, {profile: r})])
        .catch(e => console.log(e))

      console.log(result)

      return result
    },
  },
  Mutation: {
    updateThreeIDProfile: async (
      _parent: any,
      { profile, visibility = 'PRIVATE' },
      { env, jwt, coreId }: ResolverContext
    ) => {
      const oortClient = new OortClient(env.OORT, jwt)
      const profileResponse = await oortClient.getProfile()
      await checkHTTPStatus(profileResponse)
      const currentProfile = await getRPCResult(profileResponse)

      const newProfile = {
        ...currentProfile,
        ...profile,
      }

      const updateResponse = await oortClient.updateProfile(
        newProfile,
        visibility
      )
      await checkHTTPStatus(updateResponse)
      return !!(await getRPCResult(updateResponse))
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
  'Mutation.updateThreeIDAddress': [setupContext(), isAuthorized()],
  'Query.profileFromAddress': [setupContext()],
  'Mutation.updateThreeIDProfile': [setupContext(), isAuthorized()],
}

export default composeResolvers(threeIDResolvers, ThreeIDResolverComposition)
