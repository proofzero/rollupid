import { composeResolvers } from '@graphql-tools/resolvers-composition'

import createCoreClient from '@proofzero/platform-clients/core'

import {
  setupContext,
  isAuthorized,
  validateApiKey,
  logAnalytics,
  getConnectedAddresses,
  temporaryConvertToPublic,
  requestLogging,
} from './utils'

import { Resolvers } from './typedefs'
import { GraphQLError } from 'graphql'
import { AddressURN, AddressURNSpace } from '@proofzero/urns/address'
import { ResolverContext } from './common'
import { PlatformAddressURNHeader } from '@proofzero/types/headers'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import type { AccountURN } from '@proofzero/urns/account'
import {
  generateTraceContextHeaders,
  TraceSpan,
} from '@proofzero/packages/platform-middleware/trace'
import core from '@proofzero/platform-clients/core'

const accountResolvers: Resolvers = {
  Query: {
    profile: async (
      _parent: any,
      { targetAccountURN }: { targetAccountURN?: AccountURN },
      { env, accountURN, jwt, traceSpan }: ResolverContext
    ) => {
      console.log(`galaxy:profile: getting profile for account: ${accountURN}`)

      const finalAccountURN = targetAccountURN || accountURN

      const coreClient = createCoreClient(env.Core, {
        ...getAuthzHeaderConditionallyFromToken(jwt),
        ...generateTraceContextHeaders(traceSpan),
      })

      let accountProfile = await coreClient.account.getProfile.query({
        account: finalAccountURN,
      })

      return accountProfile
    },

    authorizedApps: async (
      _parent: any,
      {},
      { env, accountURN, jwt, traceSpan }: ResolverContext
    ) => {
      const coreClient = createCoreClient(env.Core, {
        ...getAuthzHeaderConditionallyFromToken(jwt),
        ...generateTraceContextHeaders(traceSpan),
      })

      const apps = await coreClient.account.getAuthorizedApps.query({
        account: accountURN,
      })

      const mappedApps = await Promise.all(
        apps.map(async (a) => {
          const { name, iconURL } =
            await coreClient.starbase.getAppPublicProps.query({
              clientId: a.clientId,
            })

          return {
            clientId: a.clientId,
            icon: iconURL,
            title: name,
            timestamp: a.timestamp,
          }
        })
      )

      return mappedApps
    },

    connectedAddresses: async (
      _parent: any,
      { targetAccountURN }: { targetAccountURN?: AccountURN },
      { env, accountURN, jwt, traceSpan }: ResolverContext
    ) => {
      const finalAccountURN = targetAccountURN || accountURN

      const addresses = await getConnectedAddresses({
        accountURN: finalAccountURN,
        Core: env.Core,
        jwt,
        traceSpan,
      })

      return addresses
    },
  },
  Mutation: {
    disconnectAddress: async (
      _parent: any,
      { addressURN }: { addressURN: AddressURN },
      { accountURN, env, jwt, traceSpan }: ResolverContext
    ) => {
      if (!AddressURNSpace.is(addressURN)) {
        throw new GraphQLError(
          'Invalid addressURN format. Base address URN expected.'
        )
      }

      const addresses = await getConnectedAddresses({
        accountURN,
        Core: env.Core,
        jwt,
        traceSpan,
      })

      const addressURNList = addresses?.map((a) => a.baseUrn) ?? []
      if (!addressURNList.includes(addressURN)) {
        throw new GraphQLError('Calling account is not address owner')
      }

      if (addressURNList.length === 1) {
        throw new GraphQLError('Cannot disconnect last address')
      }

      const coreClient = createCoreClient(env.Core, {
        [PlatformAddressURNHeader]: addressURN,
        ...generateTraceContextHeaders(traceSpan),
      })

      await coreClient.address.deleteAddressNode.mutate({
        accountURN,
      })

      return true
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

const ProfileResolverComposition = {
  'Query.profile': [
    requestLogging(),
    setupContext(),
    validateApiKey(),
    logAnalytics(),
  ],
  'Query.authorizedApps': [
    requestLogging(),
    setupContext(),
    validateApiKey(),
    logAnalytics(),
  ],
  'Query.connectedAddresses': [
    requestLogging(),
    setupContext(),
    validateApiKey(),
    logAnalytics(),
    temporaryConvertToPublic(),
  ],

  'Mutation.disconnectAddress': [
    requestLogging(),
    setupContext(),
    validateApiKey(),
    isAuthorized(),
    logAnalytics(),
  ],
}

export default composeResolvers(accountResolvers, ProfileResolverComposition)
