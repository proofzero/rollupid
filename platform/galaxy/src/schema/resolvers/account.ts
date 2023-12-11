import { composeResolvers } from '@graphql-tools/resolvers-composition'

import createCoreClient from '@proofzero/platform-clients/core'
import { AccountURN, AccountURNSpace } from '@proofzero/urns/account'

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
  PlatformAccountURNHeader,
} from '@proofzero/types/headers'
import { EDGE_ACCOUNT } from '@proofzero/platform.account/src/constants'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'

import { ResolverContext } from './common'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { GraphQLError } from 'graphql'
import { PersonaData } from '@proofzero/types/application'
import { PaymasterType } from '@proofzero/platform/starbase/src/jsonrpc/validators/app'
import { generateSmartWalletAccountUrn } from '@proofzero/platform.account/src/utils'

const accountResolvers: Resolvers = {
  Query: {
    identityFromAlias: async (
      _parent,
      { provider, alias }: { provider: string; alias: string },
      { env, traceSpan }: ResolverContext
    ) => {
      const coreClient = createCoreClient(env.Core, {
        ...generateTraceContextHeaders(traceSpan),
      })
      // TODO: this is a hack to get around the fact that sometimes the alias is url encoded
      // Ex: e@mail.com vs. e%40mail.com
      const urlEncodedAlias = encodeURIComponent(decodeURIComponent(alias))
      const identityURN = await coreClient.account.getIdentityByAlias.query({
        alias: urlEncodedAlias,
        provider,
      })

      return identityURN
    },

    accountProfile: async (
      _parent: any,
      { accountURN }: { accountURN: AccountURN },
      { env, traceSpan }: ResolverContext
    ) => {
      const coreClient = createCoreClient(env.Core, {
        [PlatformAccountURNHeader]: accountURN,
        ...generateTraceContextHeaders(traceSpan),
      })

      const accountProfile = await coreClient.account.getAccountProfile.query()

      return accountProfile
    },

    accountProfiles: async (
      _parent: any,
      { accountURNList }: { accountURNList: AccountURN[] },
      { env, traceSpan }: ResolverContext
    ) => {
      const profiles = await Promise.all(
        accountURNList.map(async (urn) => {
          const coreClient = createCoreClient(env.Core, {
            [PlatformAccountURNHeader]: urn,
            ...generateTraceContextHeaders(traceSpan),
          })

          return coreClient.account.getAccountProfile.query()
        })
      )
      return profiles
    },
  },
  Mutation: {
    updateAccountNickname: async (
      _parent: any,
      { nickname, accountURN },
      { env, traceSpan }: ResolverContext
    ) => {
      const coreClient = createCoreClient(env.Core, {
        [PlatformAccountURNHeader]: accountURN,
        ...generateTraceContextHeaders(traceSpan),
      })

      await coreClient.account.setNickname.query({
        nickname,
      })

      return true
    },
    updateConnectedAccountsProperties: async (
      _parent: any,
      { accountURNList },
      { env, jwt, identityURN }: ResolverContext
    ) => {
      const accountUrnEdges = accountURNList.map((a, i) => {
        // use the account urn space to construct a new urn with qcomps
        const parsed = AccountURNSpace.parse(a.accountURN).decoded
        const fullAccountURN = AccountURNSpace.componentizedUrn(
          parsed,
          undefined,
          {
            hidden: new Boolean(!!a.public).toString(),
            order: i.toString(),
          }
        )

        return {
          src: identityURN,
          dst: fullAccountURN,
          tag: EDGE_ACCOUNT,
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
      { env, jwt, traceSpan, identityURN, clientId, apiKey }: ResolverContext
    ) => {
      const coreClient = createCoreClient(env.Core, {
        ...getAuthzHeaderConditionallyFromToken(jwt),
        ...generateTraceContextHeaders(traceSpan),
        [AppAPIKeyHeader]: apiKey,
      })

      const [userInfo, paymaster]: [PersonaData, PaymasterType] =
        await Promise.all([
          coreClient.authorization.getUserInfo.query({ access_token: jwt }),
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
        const sessionKey = await coreClient.account.registerSessionKey.mutate({
          paymaster,
          smartContractWalletAddress,
          sessionPublicKey,
        })

        const appData = await coreClient.authorization.getAppData.query({
          clientId,
        })

        const smartWalletSessionKeys = appData?.smartWalletSessionKeys || []
        const { baseAccountURN } = generateSmartWalletAccountUrn(
          smartContractWalletAddress,
          '' // empty string because we only need a base urn
        )

        smartWalletSessionKeys.push({
          urn: baseAccountURN,
          publicSessionKey: sessionPublicKey,
        })

        await coreClient.authorization.setAppData.mutate({
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

// TODO: add account middleware
const AccountResolverComposition = {
  'Query.account': [requestLogging(), setupContext(), validateApiKey()],
  'Query.accountProfile': [requestLogging(), setupContext(), validateApiKey()],
  'Query.accountProfiles': [requestLogging(), setupContext(), validateApiKey()],
  'Mutation.updateAccountNickname': [
    requestLogging(),
    setupContext(),
    validateApiKey(),
    isAuthorized(),
  ],
  'Mutation.updateConnectedAccountsProperties': [
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

export default composeResolvers(accountResolvers, AccountResolverComposition)
