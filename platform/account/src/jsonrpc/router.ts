import { initTRPC } from '@trpc/server'
import { ZodError } from 'zod'

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
import {
  getSessionsMethod,
  GetSessionsMethodInput,
  GetSessionsMethodOutput,
} from './methods/getSessions'

import { getAddressesMethod } from './methods/getAddresses'

import {
  ValidateJWT,
  JWTAssertionTokenFromHeader,
} from '@kubelt/platform-middleware/jwt'
import { LogUsage } from '@kubelt/platform-middleware/log'
import { Scopes } from '@kubelt/platform-middleware/scopes'

import { initAccountNodeByName } from '../nodes'
import { Analytics } from '@kubelt/platform-middleware/analytics'
import { getPublicAddressesMethod } from './methods/getPublicAddresses'
import { SetLinksInput, setLinksMethod } from './methods/setLinks'
import {
  GetLinksInput,
  getLinksMethod,
  GetLinksOutput,
} from './methods/getLinks'
import {
  GetGalleryInput,
  getGalleryMethod,
  GetGalleryOutput,
} from './methods/getGallery'
import { SetGalleryInput, setGalleryMethod } from './methods/setGallery'

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
    .use(JWTAssertionTokenFromHeader)
    .use(Scopes)
    .use(LogUsage)
    .use(Analytics)
    .input(GetProfileInput)
    .output(GetProfileOutput)
    .query(getProfileMethod),
  setProfile: t.procedure
    .use(JWTAssertionTokenFromHeader)
    .use(ValidateJWT)
    .use(Scopes)
    .use(injectAccountNode)
    .use(LogUsage)
    .use(Analytics)
    .input(SetProfileInput)
    .mutation(setProfileMethod),
  getLinks: t.procedure
    .use(JWTAssertionTokenFromHeader)
    .use(Scopes)
    .use(LogUsage)
    .use(Analytics)
    .input(GetLinksInput)
    .output(GetLinksOutput)
    .query(getLinksMethod),
  setLinks: t.procedure
    .use(JWTAssertionTokenFromHeader)
    .use(ValidateJWT)
    .use(Scopes)
    .use(injectAccountNode)
    .use(LogUsage)
    .use(Analytics)
    .input(SetLinksInput)
    .mutation(setLinksMethod),
  getGallery: t.procedure
    .use(JWTAssertionTokenFromHeader)
    .use(Scopes)
    .use(LogUsage)
    .use(Analytics)
    .input(GetGalleryInput)
    .output(GetGalleryOutput)
    .query(getGalleryMethod),
  setGallery: t.procedure
    .use(JWTAssertionTokenFromHeader)
    .use(ValidateJWT)
    .use(Scopes)
    .use(injectAccountNode)
    .use(LogUsage)
    .use(Analytics)
    .input(SetGalleryInput)
    .mutation(setGalleryMethod),
  getAddresses: t.procedure
    .use(JWTAssertionTokenFromHeader)
    .use(ValidateJWT)
    .use(Scopes)
    .use(LogUsage)
    .use(Analytics)
    .input(GetAddressesInput)
    // .output(AddressListSchema)
    .query(getAddressesMethod),
  getOwnAddresses: t.procedure
    .use(JWTAssertionTokenFromHeader)
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
    .use(JWTAssertionTokenFromHeader)
    .use(ValidateJWT)
    .use(Scopes)
    .use(LogUsage)
    .use(Analytics)
    .input(HasAddressesInput)
    .mutation(hasAddressesMethod),
  getSessions: t.procedure
    .use(JWTAssertionTokenFromHeader)
    .use(ValidateJWT)
    .use(Scopes)
    .use(LogUsage)
    .input(GetSessionsMethodInput)
    .output(GetSessionsMethodOutput)
    .mutation(getSessionsMethod),
})
