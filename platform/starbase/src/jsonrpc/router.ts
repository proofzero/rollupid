import { initTRPC } from '@trpc/server'
import { ZodError } from 'zod'

import { Context } from './context'
import { LogUsage } from '@kubelt/platform-middleware/log'
import { createApp, CreateAppInputSchema, CreateAppOutputSchema } from './methods/createApp'
import { JWTAssertionTokenFromHeader, ValidateJWT } from '@kubelt/platform-middleware/jwt'
import { deleteApp } from './methods/deleteApp'
import { getAppDetails, GetAppDetailsOutputSchema } from './methods/getAppDetails'
import { listApps, ListAppsOutputSchema } from './methods/listApps'
import { AppClientIdParamSchema } from '../types'
import { rotateClientSecret, RotateClientSecretOutputSchema } from './methods/rotateClientSecret'
import { rotateApiKey, RotateApiKeyOutputSchema } from './methods/rotateApiKey'

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

export const appRouter = t.router({
  createApp: t.procedure
    .use(JWTAssertionTokenFromHeader)
    .use(ValidateJWT)
    .use(LogUsage)
    .input(CreateAppInputSchema)
    .output(CreateAppOutputSchema)
    .mutation(createApp),
  deleteApp: t.procedure
    .use(JWTAssertionTokenFromHeader)
    .use(ValidateJWT)
    .use(LogUsage)
    .input(AppClientIdParamSchema)
    .mutation(deleteApp),
  getAppDetails: t.procedure
    .use(JWTAssertionTokenFromHeader)
    .use(ValidateJWT)
    .use(LogUsage)
    .input(AppClientIdParamSchema)
    .output(GetAppDetailsOutputSchema)
    .query(getAppDetails),
  listApps: t.procedure
    .use(JWTAssertionTokenFromHeader)
    .use(ValidateJWT)
    .use(LogUsage)
    .input(AppClientIdParamSchema)
    .output(ListAppsOutputSchema)
    .query(listApps),
  rotateClientSecret: t.procedure
    .use(JWTAssertionTokenFromHeader)
    .use(ValidateJWT)
    .use(LogUsage)
    .input(AppClientIdParamSchema)
    .output(RotateClientSecretOutputSchema)
    .mutation(rotateClientSecret),
  rotateApiKey: t.procedure
    .use(JWTAssertionTokenFromHeader)
    .use(ValidateJWT)
    .use(LogUsage)
    .input(AppClientIdParamSchema)
    .output(RotateApiKeyOutputSchema)
    .mutation(rotateApiKey)

})
