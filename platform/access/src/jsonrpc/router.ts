import { initTRPC } from '@trpc/server'

import { Context } from '../context'

import { InjectEdges } from '@kubelt/platform-middleware/edges'

import {
  ValidateJWT,
  JWTAssertionTokenFromHeader,
  RequireAccount,
} from '@kubelt/platform-middleware/jwt'

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
  verifyAuthorizationMethod,
  VerifyAuthorizationMethodInput,
  VerifyAuthorizationMethodOutput,
} from './methods/verifyAuthorization'
import {
  getSessionMethod,
  GetSessionMethodInput,
  GetSessionMethodOutput,
} from './methods/getSession'
import {
  revokeSessionMethod,
  RevokeSessionMethodInput,
  RevokeSessionMethodOutput,
} from './methods/revokeSession'

import { LogUsage } from '@kubelt/platform-middleware/log'

const t = initTRPC.context<Context>().create()

export const appRouter = t.router({
  authorize: t.procedure
    .use(LogUsage)
    .input(AuthorizeMethodInput)
    .output(AuthorizeMethodOutput)
    .mutation(authorizeMethod),
  exchangeToken: t.procedure
    .use(LogUsage)
    .use(InjectEdges)
    .input(ExchangeTokenMethodInput)
    .output(ExchangeTokenMethodOutput)
    .mutation(exchangeTokenMethod),
  verifyAuthorization: t.procedure
    .use(LogUsage)
    .input(VerifyAuthorizationMethodInput)
    .output(VerifyAuthorizationMethodOutput)
    .query(verifyAuthorizationMethod),
  getSession: t.procedure
    .use(JWTAssertionTokenFromHeader)
    .use(ValidateJWT)
    .use(RequireAccount)
    .use(setAccessNode)
    .use(LogUsage)
    .input(GetSessionMethodInput)
    .output(GetSessionMethodOutput)
    .query(getSessionMethod),
  revokeSession: t.procedure
    .use(JWTAssertionTokenFromHeader)
    .use(ValidateJWT)
    .use(RequireAccount)
    .use(InjectEdges)
    .use(setAccessNode)
    .use(LogUsage)
    .input(RevokeSessionMethodInput)
    .output(RevokeSessionMethodOutput)
    .query(revokeSessionMethod),
})
