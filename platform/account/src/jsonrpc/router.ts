import { initTRPC } from '@trpc/server'
import { ZodError } from 'zod'

import { Context } from '../context'

import { getProfileMethod, GetProfileInput } from './methods/getProfile'
import { setProfileMethod, SetProfileInput } from './methods/setProfile'
import { ProfileSchema } from './middlewares/profile'

import {
  getAddressesMethod,
  GetAddressesInput,
  AddressList,
} from './methods/getAddresses'
import Account from '../nodes/account'
import { proxyDurable } from 'itty-durable'
import {
  ValidateJWT,
  JWTAssertionTokenFromHeader,
} from '@kubelt/platform-middleware/jwt'
import { LogUsage } from '@kubelt/platform-middleware/log'
import { Scopes } from '@kubelt/platform-middleware/scopes'

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

export const injectAccountNode = t.middleware(async ({ ctx, next }) => {
  const accountURN = ctx.accountURN

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

export const appRouter = t.router({
  getProfile: t.procedure
    .use(JWTAssertionTokenFromHeader)
    .use(Scopes)
    .use(LogUsage)
    .input(GetProfileInput)
    .output(ProfileSchema.nullable())
    .query(getProfileMethod),
  setProfile: t.procedure
    .use(JWTAssertionTokenFromHeader)
    .use(ValidateJWT)
    .use(Scopes)
    .use(injectAccountNode)
    .use(LogUsage)
    .input(SetProfileInput)
    .mutation(setProfileMethod),
  getAddresses: t.procedure
    .use(JWTAssertionTokenFromHeader)
    .use(ValidateJWT)
    .use(Scopes)
    .use(LogUsage)
    .input(GetAddressesInput)
    // TODO this causes a type checking error
    //.output(AddressList)
    .mutation(getAddressesMethod),
})
