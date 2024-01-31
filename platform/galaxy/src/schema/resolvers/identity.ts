import { composeResolvers } from '@graphql-tools/resolvers-composition'

import createCoreClient from '@proofzero/platform-clients/core'

import {
  setupContext,
  isAuthorized,
  validateApiKey,
  logAnalytics,
  getConnectedAccounts,
  temporaryConvertToPublic,
  requestLogging,
} from './utils'

import { Resolvers } from './typedefs'
import { GraphQLError } from 'graphql'
import { AccountURN, AccountURNSpace } from '@proofzero/urns/account'
import { ResolverContext } from './common'
import { PlatformAccountURNHeader } from '@proofzero/types/headers'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import type { IdentityURN } from '@proofzero/urns/identity'
import {
  generateTraceContextHeaders,
  TraceSpan,
} from '@proofzero/packages/platform-middleware/trace'
import core from '@proofzero/platform-clients/core'

const identityResolvers: Resolvers = {
  Query: {
    profile: async (
      _parent: any,
      { targetIdentityURN }: { targetIdentityURN?: IdentityURN },
      { env, identityURN, jwt, traceSpan }: ResolverContext
    ) => {
      console.log(
        `galaxy:profile: getting profile for identity: ${identityURN}`
      )

      const finalIdentityURN = targetIdentityURN || identityURN

      const coreClient = createCoreClient(env.Core, {
        ...getAuthzHeaderConditionallyFromToken(jwt),
        ...generateTraceContextHeaders(traceSpan),
      })

      let identityProfile = await coreClient.identity.getProfile.query({
        identity: finalIdentityURN,
      })

      return identityProfile
    },

    authorizedApps: async (
      _parent: any,
      {},
      { env, identityURN, jwt, traceSpan }: ResolverContext
    ) => {
      const coreClient = createCoreClient(env.Core, {
        ...getAuthzHeaderConditionallyFromToken(jwt),
        ...generateTraceContextHeaders(traceSpan),
      })

      const apps = await coreClient.identity.getAuthorizedApps.query({
        identity: identityURN,
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

    connectedAccounts: async (
      _parent: any,
      { targetIdentityURN }: { targetIdentityURN?: IdentityURN },
      { env, identityURN, jwt, traceSpan }: ResolverContext
    ) => {
      const finalIdentityURN = targetIdentityURN || identityURN

      const accounts = await getConnectedAccounts({
        identityURN: finalIdentityURN,
        Core: env.Core,
        jwt,
        traceSpan,
      })

      return accounts
    },
  },
  Mutation: {
    disconnectAccount: async (
      _parent: any,
      { accountURN }: { accountURN: AccountURN },
      { identityURN, env, jwt, traceSpan }: ResolverContext
    ) => {
      if (!AccountURNSpace.is(accountURN)) {
        throw new GraphQLError(
          'Invalid accountURN format. Base account URN expected.'
        )
      }

      const accounts = await getConnectedAccounts({
        identityURN,
        Core: env.Core,
        jwt,
        traceSpan,
      })

      const accountURNList = accounts?.map((a) => a.baseUrn) ?? []
      if (!accountURNList.includes(accountURN)) {
        throw new GraphQLError('Calling identity is not account owner')
      }

      if (accountURNList.length === 1) {
        throw new GraphQLError('Cannot disconnect last account')
      }

      const coreClient = createCoreClient(env.Core, {
        [PlatformAccountURNHeader]: accountURN,
        ...generateTraceContextHeaders(traceSpan),
      })

      await coreClient.account.deleteAccountNode.mutate({
        identityURN,
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
  'Query.connectedAccounts': [
    requestLogging(),
    setupContext(),
    validateApiKey(),
    logAnalytics(),
    temporaryConvertToPublic(),
  ],

  'Mutation.disconnectAccount': [
    requestLogging(),
    setupContext(),
    validateApiKey(),
    isAuthorized(),
    logAnalytics(),
  ],
}

export default composeResolvers(identityResolvers, ProfileResolverComposition)
