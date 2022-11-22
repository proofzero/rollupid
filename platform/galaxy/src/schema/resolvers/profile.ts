import { composeResolvers } from '@graphql-tools/resolvers-composition'
import { getDefaultProvider, AlchemyProvider } from '@ethersproject/providers'

import Env from '../../env'
import OortClient from './clients/oort'

import { WorkerApi as AccountApi } from '@kubelt/platform.account/src/types'
// import { HEADER_CORE_ADDRESS } from '@kubelt/platform.commons/src/constants'
import { createFetcherJsonRpcClient } from '@kubelt/platform.commons/src/jsonrpc'

import {
  setupContext,
  isAuthorized,
  checkHTTPStatus,
  getRPCResult,
} from './utils'

import { Resolvers } from './typedefs'
import { GraphQLYogaError } from '@graphql-yoga/common'

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
      const accountClient = createFetcherJsonRpcClient<AccountApi>(env.Account, {
        // headers: {
        //   [HEADER_ACCESS_TOKEN]: request.headers.get(HEADER_CORE_ADDRESS) as string,
        // },
      })

      console.log('here we are', accountClient)

      // Migration logic:
      // If there's an account profile, we're done.
      let accountProfile = null
      
      try {
        accountProfile = await accountClient.kb_getProfile(address)
      } catch (e) {
        console.log('falsy accountProfile:', e)
        
        // If there's not an account profile, check Oort.
        const oortClient = new OortClient(env.OORT)
        console.log('1')
        const oortProfile = await oortClient.getProfileFromAddress(address)
        console.log('2')

        console.log('oortProfile', oortProfile)

        if (oortProfile) {
          // If there's an Oort profile, set it as the account profile and return.
          accountProfile = oortProfile
          console.log('setting accountProfile')
          try {
            await accountClient.kb_setProfile(accountProfile)
          } catch (e) {
            console.log('accountClient error', e)
          }
        }

        // If there's no Oort profile and no Account profile, there's no profile. Return null.
      }

      console.log('checking status')
      await checkHTTPStatus(accountProfile)
      console.log('returning result')
      return await getRPCResult(accountProfile)
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
