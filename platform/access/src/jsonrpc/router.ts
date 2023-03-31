import { initTRPC } from '@trpc/server'

import { errorFormatter } from '@proofzero/utils/trpc'

import { Context } from '../context'

import { InjectEdges } from '@proofzero/platform-middleware/edges'

import {
  ValidateJWT,
  AuthorizationTokenFromHeader,
  RequireAccount,
} from '@proofzero/platform-middleware/jwt'

import { setAccessNode } from './middleware/setAccessNode'

import {
  authorizeMethod,
  AuthorizeMethodInput,
  AuthorizeMethodOutput,
} from './methods/authorize'
import {
  exchangeTokenMethod,
  ExchangeTokenMethodInput,
  ExchangeTokenMethodOutput,
} from './methods/exchangeToken'
import {
  verifyTokenMethod,
  VerifyTokenMethodInput,
  VerifyTokenMethodOutput,
} from './methods/verifyToken'
import {
  revokeTokenMethod,
  RevokeTokenMethodInput,
  RevokeTokenMethodOutput,
} from './methods/revokeToken'

import { LogUsage } from '@proofzero/platform-middleware/log'

import { Analytics } from '@proofzero/platform-middleware/analytics'
import {
  GetUserInfoInput,
  getUserInfoMethod,
  GetUserInfoOutput,
} from './methods/getUserInfo'

import {
  getAuthorizedAppScopesMethod,
  GetAuthorizedAppScopesMethodInput,
  GetAuthorizedAppScopesMethodOutput,
} from './methods/getAuthorizedAppScopes'

import {
  RevokeAppAuthorizationMethodInput,
  RevokeAppAuthorizationMethodOutput,
  revokeAppAuthorizationMethod,
} from './methods/revokeAppAuthorization'
import {
  GetPersonaDataInput,
  getPersonaDataMethod,
  GetPersonaDataOutput,
} from './methods/getPersonaData'

const t = initTRPC.context<Context>().create({ errorFormatter })

export const appRouter = t.router({
  authorize: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .input(AuthorizeMethodInput)
    .output(AuthorizeMethodOutput)
    .mutation(authorizeMethod),
  exchangeToken: t.procedure
    .use(LogUsage)
    .use(({ ctx, path, type, next, input, rawInput, meta }) => {
      const typedInput = rawInput as { clientId: string; grantType: string }
      const newCtx = {
        ...ctx,
        CustomAnalyticsFunction: () => {
          return {
            indexes: [typedInput['clientId']],
            blobs: [typedInput['grantType']],
          }
        },
      }
      return Analytics({
        ctx: newCtx,
        path,
        type,
        next,
        input,
        rawInput,
        meta,
      })
    })
    .use(InjectEdges)
    .input(ExchangeTokenMethodInput)
    .output(ExchangeTokenMethodOutput)
    .mutation(exchangeTokenMethod),
  verifyToken: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .input(VerifyTokenMethodInput)
    .output(VerifyTokenMethodOutput)
    .query(verifyTokenMethod),
  revokeToken: t.procedure
    .use(AuthorizationTokenFromHeader)
    .use(ValidateJWT)
    .use(RequireAccount)
    .use(InjectEdges)
    .use(setAccessNode)
    .use(LogUsage)
    .use(Analytics)
    .input(RevokeTokenMethodInput)
    .output(RevokeTokenMethodOutput)
    .mutation(revokeTokenMethod),
  revokeAppAuthorization: t.procedure
    .use(AuthorizationTokenFromHeader)
    .use(ValidateJWT)
    .use(InjectEdges)
    .use(LogUsage)
    .use(Analytics)
    .input(RevokeAppAuthorizationMethodInput)
    .output(RevokeAppAuthorizationMethodOutput)
    .mutation(revokeAppAuthorizationMethod),
  getUserInfo: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .input(GetUserInfoInput)
    .output(GetUserInfoOutput)
    .query(getUserInfoMethod),
  getPersonaData: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .input(GetPersonaDataInput)
    .output(GetPersonaDataOutput)
    .query(getPersonaDataMethod),
  getAuthorizedAppScopes: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .input(GetAuthorizedAppScopesMethodInput)
    .output(GetAuthorizedAppScopesMethodOutput)
    .query(getAuthorizedAppScopesMethod),
})
