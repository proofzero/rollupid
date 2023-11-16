import { composeResolvers } from '@graphql-tools/resolvers-composition'
import type { Resolvers } from './typedefs'
import {
  validateApiKey,
  isAuthorized,
  logAnalytics,
  requestLogging,
  setupContext,
  validateJWTAndAPIKeyPresence,
} from './utils'
import { ResolverContext } from './common'
import createCoreClient from '@proofzero/platform-clients/core'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { AppFeatures } from '@proofzero/platform.starbase/src/types'
import { BadRequestError } from '@proofzero/errors'

const authorizationResolvers: Resolvers = {
  Query: {
    getExternalData: async (
      _parent: any,
      {},
      { env, jwt, traceSpan, clientId }: ResolverContext
    ) => {
      const coreClient = createCoreClient(env.Core, {
        ...getAuthzHeaderConditionallyFromToken(jwt),
        ...generateTraceContextHeaders(traceSpan),
      })

      const appFeatures = await coreClient.starbase.getFeatures.query({
        clientId,
      })
      if ((appFeatures & AppFeatures.STORAGE) === 0) {
        throw new BadRequestError({
          message: 'App does not have storage feature enabled',
        })
      }

      return coreClient.authorization.getExternalData.query({
        clientId,
      })
    },
  },
  Mutation: {
    setExternalData: async (
      _parent: any,
      { payload },
      { env, jwt, traceSpan, clientId }: ResolverContext
    ) => {
      const coreClient = createCoreClient(env.Core, {
        ...getAuthzHeaderConditionallyFromToken(jwt),
        ...generateTraceContextHeaders(traceSpan),
      })

      const appFeatures = await coreClient.starbase.getFeatures.query({
        clientId,
      })
      if ((appFeatures & AppFeatures.STORAGE) === 0) {
        throw new BadRequestError({
          message: 'App does not have storage feature enabled',
        })
      }

      try {
        await coreClient.authorization.setExternalData.mutate({
          clientId,
          payload,
        })
      } catch (ex) {
        console.error(ex)
        return false
      }

      return true
    },
  },
}

const AuthorizationResolverComposition = {
  'Query.getExternalData': [
    requestLogging(),
    setupContext(),
    validateJWTAndAPIKeyPresence(),
    validateApiKey(),
    isAuthorized(),
    logAnalytics(),
  ],
  'Mutation.setExternalData': [
    requestLogging(),
    setupContext(),
    validateJWTAndAPIKeyPresence(),
    validateApiKey(),
    isAuthorized(),
    logAnalytics(),
  ],
}

export default composeResolvers(
  authorizationResolvers,
  AuthorizationResolverComposition
)
