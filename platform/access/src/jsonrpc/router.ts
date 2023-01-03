import { initTRPC } from '@trpc/server'

import { Context } from '../context'

import {
  authorizeMethod,
  AuthorizeMethodInput,
  AuthorizeMethodOutput,
} from './methods/authorize'
import {
  exchangeTokenMethod,
  ExchangeTokenMethodInput,
  ExchangeTokenOutput,
} from './methods/authorize'
import {
  verifyAuthorizationMethod,
  VerifyAuthorizationMethodInput,
  VerifyAuthorizationMethodOutput,
} from './methods/verifyAuthorization'

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
    .input(ExchangeTokenMethodInput)
    .output(ExchangeTokenOutput)
    .mutation(exchangeTokenMethod),
  verifyAuthorization: t.procedure
    .use(LogUsage)
    .input(VerifyAuthorizationMethodInput)
    .output(VerifyAuthorizationMethodOutput)
    .query(verifyAuthorizationMethod),
})
