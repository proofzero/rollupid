import { composeResolvers } from '@graphql-tools/resolvers-composition'

import createCoreClient from '@proofzero/platform-clients/core'
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
import { generateSmartWalletAddressUrn } from '@proofzero/platform.address/src/utils'

const addressResolvers: Resolvers = {
  Query: {
    accountFromAlias: async (
      _parent,
      { provider, alias }: { provider: string; alias: string },
      { env, traceSpan }: ResolverContext
    ) => {
      const coreClient = createCoreClient(env.Core, {
        ...generateTraceContextHeaders(traceSpan),
      })
      const accountURN = await coreClient.address.getAccountByAlias.query({
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
      const coreClient = createCoreClient(env.Core, {
        [PlatformAddressURNHeader]: addressURN,
        ...generateTraceContextHeaders(traceSpan),
      })

      const addressProfile = await coreClient.address.getAddressProfile.query()

      return addressProfile
    },

    addressProfiles: async (
      _parent: any,
      { addressURNList }: { addressURNList: AddressURN[] },
      { env, traceSpan }: ResolverContext
    ) => {
      const profiles = await Promise.all(
        addressURNList.map(async (urn) => {
          const coreClient = createCoreClient(env.Core, {
            [PlatformAddressURNHeader]: urn,
            ...generateTraceContextHeaders(traceSpan),
          })

          return coreClient.address.getAddressProfile.query()
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
      const coreClient = createCoreClient(env.Core, {
        [PlatformAddressURNHeader]: addressURN,
        ...generateTraceContextHeaders(traceSpan),
      })

      await coreClient.address.setNickname.query({
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
      const coreClient = createCoreClient(env.Core, {
        ...getAuthzHeaderConditionallyFromToken(jwt),
        ...generateTraceContextHeaders(traceSpan),
        [AppAPIKeyHeader]: apiKey,
      })

      const [userInfo, paymaster]: [PersonaData, PaymasterType] =
        await Promise.all([
          coreClient.access.getUserInfo.query({ access_token: jwt }),
          coreClient.starbase.getPaymaster.query({ clientId }),
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

      try {
        const sessionKey = await coreClient.address.registerSessionKey.mutate({
          paymaster,
          smartContractWalletAddress,
          sessionPublicKey,
        })

        const appData = await coreClient.access.getAppData.query({
          clientId,
        })

        const smartWalletSessionKeys = appData?.smartWalletSessionKeys || []
        const { baseAddressURN } = generateSmartWalletAddressUrn(
          smartContractWalletAddress,
          '' // empty string because we only need a base urn
        )

        smartWalletSessionKeys.push({
          urn: baseAddressURN,
          publicSessionKey: sessionPublicKey,
        })

        await coreClient.access.setAppData.mutate({
          clientId,
          appData: {
            smartWalletSessionKeys,
          },
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
  'Query.account': [requestLogging(), setupContext(), validateApiKey()],
  'Query.addressProfile': [requestLogging(), setupContext(), validateApiKey()],
  'Query.addressProfiles': [requestLogging(), setupContext(), validateApiKey()],
  'Mutation.updateAddressNickname': [
    requestLogging(),
    setupContext(),
    validateApiKey(),
    isAuthorized(),
  ],
  'Mutation.updateConnectedAddressesProperties': [
    requestLogging(),
    setupContext(),
    validateApiKey(),
    isAuthorized(),
  ],
  'Mutation.registerSessionKey': [
    requestLogging(),
    setupContext(),
    validateApiKey(),
  ],
}

export default composeResolvers(addressResolvers, AddressResolverComposition)
