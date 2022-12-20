import { initTRPC } from '@trpc/server'
import { ZodError } from 'zod'

import { jwt } from '@kubelt/platform-middleware'

import { Context } from '../context'

import { getProfileMethod, GetProfileInput } from './methods/getProfile'
import { setProfileMethod, SetProfileInput } from './methods/setProfile'
import {
  getAddressesMethod,
  GetAddressesInput,
  AddressList,
} from './methods/getAddresses'
import Account from '../nodes/account'
import { proxyDurable } from 'itty-durable'
import { Profile } from './middlewares/profile'

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.code === 'BAD_REQUEST' && error.cause instanceof ZodError
            ? error.cause.flatten()
            : null,
      },
    }
  },
})

export const scopes = t.middleware(async ({ ctx, next }) => {
  // TODO: check scopes
  return next({ ctx })
})

export const injectAccountNode = t.middleware(async ({ ctx, next }) => {
  const token = ctx.token

  if (!token) throw new Error('No JWT found in headers')

  // TODO: validate token

  const { accountURN } = jwt.AccountJWTFromHeader(token)

  if (!accountURN) throw new Error('No accountURN found in JWT')

  const proxy = await proxyDurable(ctx.Account, {
    name: 'account',
    class: Account,
    parse: true,
  })

  const account = proxy.get(accountURN) as Account

  return next({
    ctx: {
      account,
      ...ctx,
    },
  })
})

export const logUsage = t.middleware(async ({ path, type, next }) => {
  const start = Date.now()
  const result = await next()
  const durationMs = Date.now() - start
  result.ok
    ? console.log('OK request timing:', { path, type, durationMs })
    : console.log('Non-OK request timing', { path, type, durationMs })
  return result
})

export const appRouter = t.router({
  getProfile: t.procedure
    .use(scopes)
    .use(logUsage)
    .input(GetProfileInput)
    .output(Profile)
    .query(getProfileMethod),
  setProfile: t.procedure
    .use(scopes)
    .use(injectAccountNode)
    .use(logUsage)
    .input(SetProfileInput)
    .mutation(setProfileMethod),
  getAddresses: t.procedure
    .use(scopes)
    .use(logUsage)
    .input(GetAddressesInput)
    .output(AddressList)
    .mutation(getAddressesMethod),
})

export type AccountRouter = typeof appRouter
