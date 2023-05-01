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

import { PlatformAddressURNHeader } from '@proofzero/types/headers'
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

    registerSessionKey: async (
      _parent: any,
      {
        accountUrn,
        sessionPublicKey,
        smartContractWalletAddress,
      }: {
        accountUrn: string
        sessionPublicKey: string
        smartContractWalletAddress: string
      },
      { env, jwt, traceSpan }: ResolverContext
    ) => {
      const accessClient = createAccessClient(env.Access, {
        ...getAuthzHeaderConditionallyFromToken(jwt),
        ...generateTraceContextHeaders(traceSpan),
      })
      const starbaseClient = createStarbaseClient(env.Starbase, {
        ...getAuthzHeaderConditionallyFromToken(jwt),
        ...generateTraceContextHeaders(traceSpan),
      })

      const { aud } = parseJwt(jwt)

      const clientId = aud![0]

      const [personaData, paymaster]: [PersonaData, PaymasterType] =
        await Promise.all([
          accessClient.getPersonaData.query({ clientId, accountUrn }),
          starbaseClient.getPaymaster.query({ clientId }),
        ])

      if (
        !personaData ||
        personaData.smart_contract_wallet !== smartContractWalletAddress
      ) {
        throw new GraphQLError('Invalid smart contract wallet address.')
      }

      const addressClient = createAddressClient(env.Address, {
        ...generateTraceContextHeaders(traceSpan),
      })

      try {
        const sessionKey = await addressClient.registerSessionKey.query({
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

      // const edgesClient = createAddressClient(env.Edges, {

      return true
    },
  },
}

// TODO: add address middleware
const AddressResolverComposition = {
  'Query.account': [requestLogging(), setupContext(), validateApiKey()],
  'Query.addressProfile': [requestLogging(), setupContext(), validateApiKey()],
  'Query.addressProfiles': [requestLogging(), setupContext(), validateApiKey()],
  'Query.registerSessionKey': [
    requestLogging(),
    setupContext(),
    validateApiKey(),
    isAuthorized(),
  ],
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
}

export default composeResolvers(addressResolvers, AddressResolverComposition)
