import { composeResolvers } from '@graphql-tools/resolvers-composition'

import createAddressClient from '@proofzero/platform-clients/address'
import createAccessClient from '@proofzero/platform-clients/access'
import createStarbaseClient from '@proofzero/platform-clients/starbase'
import { AddressURN, AddressURNSpace } from '@proofzero/urns/address'

import { Resolvers } from './typedefs'
import {
  validateApiKey,
  setupContext,
  isAuthorized,
  requestLogging,
  parseJwt,
} from './utils'

import {
  AppAPIKeyHeader,
  PlatformAddressURNHeader,
} from '@proofzero/types/headers'
import { EDGE_ADDRESS } from '@proofzero/platform.address/src/constants'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'

import { ResolverContext } from './common'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { GraphQLError } from 'graphql'
import { PersonaData } from '@proofzero/types/application'
import { PaymasterType } from '@proofzero/platform/starbase/src/jsonrpc/validators/app'

const addressResolvers: Resolvers = {
  Query: {
    accountFromAlias: async (
      _parent,
      { provider, alias }: { provider: string; alias: string },
      { env, traceSpan }: ResolverContext
    ) => {
      const addressClient = createAddressClient(env.Address, {
        ...generateTraceContextHeaders(traceSpan),
      })
      const accountURN = await addressClient.getAccountByAlias.query({
        alias,
        provider,
      })

      return accountURN
    },

    addressProfile: async (
      _parent: any,
      { addressURN }: { addressURN: AddressURN },
      { env, traceSpan }: ResolverContext
    ) => {
      const addressClient = createAddressClient(env.Address, {
        [PlatformAddressURNHeader]: addressURN,
        ...generateTraceContextHeaders(traceSpan),
      })

      const addressProfile = await addressClient.getAddressProfile.query()

      return addressProfile
    },

    addressProfiles: async (
      _parent: any,
      { addressURNList }: { addressURNList: AddressURN[] },
      { env, traceSpan }: ResolverContext
    ) => {
      const profiles = await Promise.all(
        addressURNList.map(async (urn) => {
          const addressClient = createAddressClient(env.Address, {
            [PlatformAddressURNHeader]: urn,
            ...generateTraceContextHeaders(traceSpan),
          })

          return addressClient.getAddressProfile.query()
        })
      )
      return profiles
    },
  },
  Mutation: {
    updateAddressNickname: async (
      _parent: any,
      { nickname, addressURN },
      { env, traceSpan }: ResolverContext
    ) => {
      const addressClient = createAddressClient(env.Address, {
        [PlatformAddressURNHeader]: addressURN,
        ...generateTraceContextHeaders(traceSpan),
      })

      await addressClient.setNickname.query({
        nickname,
      })

      return true
    },
    updateConnectedAddressesProperties: async (
      _parent: any,
      { addressURNList },
      { env, jwt, accountURN }: ResolverContext
    ) => {
      const addressUrnEdges = addressURNList.map((a, i) => {
        // use the address urn space to construct a new urn with qcomps
        const parsed = AddressURNSpace.parse(a.addressURN).decoded
        const fullAddressURN = AddressURNSpace.componentizedUrn(
          parsed,
          undefined,
          {
            hidden: new Boolean(!!a.public).toString(),
            order: i.toString(),
          }
        )

        return {
          src: accountURN,
          dst: fullAddressURN,
          tag: EDGE_ADDRESS,
        }
      })

      return true
    },
    registerSessionKey: async (
      _parent: any,
      {
        sessionPublicKey,
        smartContractWalletAddress,
      }: {
        sessionPublicKey: string
        smartContractWalletAddress: string
      },
      { env, jwt, traceSpan, accountURN, clientId, apiKey }: ResolverContext
    ) => {
      const accessClient = createAccessClient(env.Access, {
        ...getAuthzHeaderConditionallyFromToken(jwt),
        ...generateTraceContextHeaders(traceSpan),
      })
      const starbaseClient = createStarbaseClient(env.Starbase, {
        ...getAuthzHeaderConditionallyFromToken(jwt),
        ...generateTraceContextHeaders(traceSpan),
        [AppAPIKeyHeader]: apiKey,
      })

      const [userInfo, paymaster]: [PersonaData, PaymasterType] =
        await Promise.all([
          accessClient.getUserInfo.query({ access_token: jwt }),
          starbaseClient.getPaymaster.query({ clientId }),
        ])

      if (
        !userInfo ||
        !userInfo.erc_4337.some(
          (scWallet: { nickname: string; address: string }) =>
            scWallet.address === smartContractWalletAddress
        )
      ) {
        throw new GraphQLError('Invalid smart contract wallet address.')
      }

      const addressClient = createAddressClient(env.Address, {
        ...generateTraceContextHeaders(traceSpan),
      })

      try {
        const sessionKey = await addressClient.registerSessionKey.mutate({
          paymaster,
          smartContractWalletAddress,
          sessionPublicKey,
        })

        return sessionKey
      } catch (e) {
        throw new GraphQLError('Failed to register session key.')
      }
    },
  },
}

// TODO: add address middleware
const AddressResolverComposition = {
  'Query.account': [
    requestLogging(),
    setupContext(),
    isAuthorized('profile'),
    validateApiKey(),
  ],

  'Query.addressProfile': [
    requestLogging(),
    setupContext(),
    isAuthorized('profile'),
    validateApiKey(),
  ],
  'Query.addressProfiles': [
    requestLogging(),
    setupContext(),
    isAuthorized('connected_accounts'),
    validateApiKey(),
  ],
  'Mutation.registerSessionKey': [
    requestLogging(),
    setupContext(),
    isAuthorized('erc_4337'),
    validateApiKey(),
  ],
}

export default composeResolvers(addressResolvers, AddressResolverComposition)
