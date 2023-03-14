import { initTRPC } from '@trpc/server'

import { errorFormatter } from '@proofzero/utils/trpc'

import { Context } from '../context'

import {
  getProfileMethod,
  GetProfileInput,
  GetProfileOutput,
} from './methods/getProfile'
import { setProfileMethod, SetProfileInput } from './methods/setProfile'
import {
  getOwnAddressesMethod,
  GetAddressesInput,
} from './methods/getOwnAddresses'
import { hasAddressesMethod, HasAddressesInput } from './methods/hasAddresses'

import { getAddressesMethod } from './methods/getAddresses'

import {
  ValidateJWT,
  AuthorizationTokenFromHeader,
} from '@proofzero/platform-middleware/jwt'
import { LogUsage } from '@proofzero/platform-middleware/log'
import { Scopes } from '@proofzero/platform-middleware/scopes'

import { initAccountNodeByName } from '../nodes'
import { Analytics } from '@proofzero/platform-middleware/analytics'
import { getPublicAddressesMethod } from './methods/getPublicAddresses'

import {
  GetAuthorizedAppsMethodInput,
  GetAuthorizedAppsMethodOutput,
  getAuthorizedAppsMethod,
} from './methods/getAuthorizedApps'

const t = initTRPC.context<Context>().create({ errorFormatter })

export const injectAccountNode = t.middleware(async ({ ctx, next }) => {
  const accountURN = ctx.accountURN

  if (!accountURN) throw new Error('No accountURN in context')

  const account = await initAccountNodeByName(accountURN, ctx.Account)

  return next({
    ctx: {
      account,
      ...ctx,
    },
  })
})

export const appRouter = t.router({
  getProfile: t.procedure
    .use(AuthorizationTokenFromHeader)
    .use(Scopes)
    .use(LogUsage)
    .use(Analytics)
    .input(GetProfileInput)
    .output(GetProfileOutput)
    .query(getProfileMethod),
  setProfile: t.procedure
    .use(AuthorizationTokenFromHeader)
    .use(ValidateJWT)
    .use(Scopes)
    .use(injectAccountNode)
    .use(LogUsage)
    .use(Analytics)
    .input(SetProfileInput)
    .mutation(setProfileMethod),
  getAddresses: t.procedure
    .use(AuthorizationTokenFromHeader)
    .use(Scopes)
    .use(LogUsage)
    .use(Analytics)
    .input(GetAddressesInput)
    // .output(AddressListSchema)
    .query(getAddressesMethod),
  getOwnAddresses: t.procedure
    .use(AuthorizationTokenFromHeader)
    .use(ValidateJWT)
    .use(Scopes)
    .use(LogUsage)
    .use(Analytics)
    .input(GetAddressesInput)
    // .output(AddressListSchema)
    .query(getOwnAddressesMethod),
  getPublicAddresses: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .input(GetAddressesInput)
    // .output(AddressListSchema)
    .query(getPublicAddressesMethod),
  hasAddresses: t.procedure
    .use(AuthorizationTokenFromHeader)
    .use(ValidateJWT)
    .use(Scopes)
    .use(LogUsage)
    .use(Analytics)
    .input(HasAddressesInput)
    .mutation(hasAddressesMethod),
  getAuthorizedApps: t.procedure
    .use(AuthorizationTokenFromHeader)
    .use(ValidateJWT)
    .use(Scopes)
    .use(LogUsage)
    .input(GetAuthorizedAppsMethodInput)
    .output(GetAuthorizedAppsMethodOutput)
    .query(getAuthorizedAppsMethod),
})
