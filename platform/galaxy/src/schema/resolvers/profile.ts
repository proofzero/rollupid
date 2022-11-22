import { composeResolvers } from '@graphql-tools/resolvers-composition'
import { getDefaultProvider, AlchemyProvider } from '@ethersproject/providers'

import Env from '../../env'
import OortClient from './clients/oort'

import { WorkerApi as AccountApi } from '@kubelt/platform.account/src/types'
import { HEADER_CORE_ADDRESS } from '@kubelt/platform.commons/src/constants'
import { createFetcherJsonRpcClient } from '@kubelt/platform.commons/src/jsonrpc'

import * as openrpc from '@kubelt/openrpc'

import {
  setupContext,
  isAuthorized,
  checkHTTPStatus,
  getRPCResult,
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

      const accountClient = createFetcherJsonRpcClient<AccountApi>(env.Account, {
        headers: {
          [HEADER_CORE_ADDRESS]: address,
        },
      })

      const oortClient = new OortClient(env.OORT)

      // Migration logic:
      // If there's an account profile, we're done.
      // If there's not an account profile, check Oort.
      // If there's an Oort profile, set it as the account profile and return.
      // If there's no Oort profile and no Account profile, there's no profile. Return null.
      
      // return accountClient.kb_getProfile(address)
      //   .catch(async (_) => oortClient.getProfileFromAddress(address))

      //   .then(async (r) => [r, await checkHTTPStatus(r)])
      //   .catch(async (e) => console.error('Error checking HTTP Status:', e))
        
      //   .then(async ([r, _]) => getRPCResult(r))
      //   .catch(async (e) => console.error('Error getting RPC result:', e))
        
      //   .then(async (rpc) => [rpc, await accountClient.kb_setProfile(rpc)])
      //   .catch(async (e) => console.error('Error saving to Account service:', e))
        
      //   .finally(async ([rpc, _]) => { console.log(rpc); return rpc})
        
      let accountProfile = undefined
      
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
          // console.log('setting accountProfile', accountProfile)
          // try {
          //   const profileObject = getRPCResult(accountProfile)
          //   console.log('profileObject', profileObject)
          //   await accountClient.kb_setProfile(profileObject)
          // } catch (e) {
          //   console.log('accountClient error', e)
          // }
        }

        // If there's no Oort profile and no Account profile, there's no profile. Return null.
      }

      console.log('checking status')
      await checkHTTPStatus(accountProfile)

      console.log('getting result')
      const result = await getRPCResult(accountProfile)
        .then(r => accountClient.kb_setProfile(r))
        .catch(e => console.log(e))

      console.log('RPC result', result)
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
