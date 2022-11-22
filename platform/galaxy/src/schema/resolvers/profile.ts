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

      console.log('=-=-=-=-=-=-=-=-=-=- here 1')
      const addressClient = createFetcherJsonRpcClient<AddressApi>(env.Address)
      console.log('=-=-=-=-=-=-=-=-=-=- here 2')
      const coreId = await addressClient.kb_resolveAddress(address)
      console.log('=-=-=-=-=-=-=-=-=-=- here 3')

      const accountClient = createFetcherJsonRpcClient<AccountApi>(env.Account)
      console.log('=-=-=-=-=-=-=-=-=-=- here 4')
      const oortClient = new OortClient(env.OORT)
      console.log('=-=-=-=-=-=-=-=-=-=- here 5')

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
        
      let accountProfile = await accountClient.kb_getProfile(coreId)
      console.log('accountProfile -=-=-=-=-=-=-=-=-=-=-', accountProfile)

      // https://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object
      const isEmptyObject = (obj) => (
        !(obj && Object.keys(obj).length == 0 && Object.getPrototypeOf(obj) == Object.prototype)
      )

      if (isEmptyObject(accountProfile)) {
        accountProfile = await oortClient.getProfileFromAddress(address)
        console.log('accountProfile -=-=-=-=-=-=-=-=-=-=- from oort', accountProfile)
      }
      // } catch (e) {
      //   console.log('falsy accountProfile:', e)
      //   console.log('1')
      //   const oortProfile = await oortClient.getProfileFromAddress(address)
      //   console.log('2')

      //   console.log('oortProfile', oortProfile)

      //   if (oortProfile) {
      //     // If there's an Oort profile, set it as the account profile and return.
      //     accountProfile = oortProfile
      //     // console.log('setting accountProfile', accountProfile)
      //     // try {
      //     //   const profileObject = getRPCResult(accountProfile)
      //     //   console.log('profileObject', profileObject)
      //     //   await accountClient.kb_setProfile(profileObject)
      //     // } catch (e) {
      //     //   console.log('accountClient error', e)
      //     // }
      //   }

      //   // If there's no Oort profile and no Account profile, there's no profile. Return null.
      // }

      console.log('checking status')
      await checkHTTPStatus(accountProfile)

      console.log('getting result')
      const [result, _] = await getRPCResult(accountProfile)
        .then(r => [r, accountClient.kb_setProfile(coreId, r)])
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
