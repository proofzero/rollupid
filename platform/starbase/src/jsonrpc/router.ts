import { initTRPC } from '@trpc/server'
import { ZodError } from 'zod'

import { Context } from './context'
import { LogUsage } from '@kubelt/platform-middleware/log'
import {
  createApp,
  CreateAppInputSchema,
  CreateAppOutputSchema,
} from './methods/createApp'
import {
  JWTAssertionTokenFromHeader,
  ValidateJWT,
} from '@kubelt/platform-middleware/jwt'
import { deleteApp } from './methods/deleteApp'
import {
  getAppDetails,
  GetAppDetailsOutputSchema,
} from './methods/getAppDetails'
import { listApps, ListAppsOutputSchema, NoInput } from './methods/listApps'
import { AppClientIdParamSchema, AppUpdateableFieldsSchema } from '../types'
import {
  rotateClientSecret,
  RotateClientSecretOutputSchema,
} from './methods/rotateClientSecret'
import { rotateApiKey, RotateApiKeyOutputSchema } from './methods/rotateApiKey'
import {
  checkAppAuth,
  CheckAppAuthInputSchema,
  CheckAppAuthOutputSchema,
} from './methods/checkAppAuth'
import {
  publishApp,
  PublishAppInputSchema,
  PublishAppOutputSchema,
} from './methods/publishApp'
import { getAppProfile } from './methods/getAppProfile'
import { updateApp, UpdateAppInputSchema } from './methods/updateApp'
import { getScopes } from './methods/getAppProfile copy'
import {
  checkApiKey,
  CheckApiKeyInputSchema,
  CheckApiKeyOutputSchema,
} from './methods/checkApiKey'

const t = initTRPC.context<Context>().create()

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
  updateApp: t.procedure
    .use(JWTAssertionTokenFromHeader)
    .use(ValidateJWT)
    .use(LogUsage)
    .input(UpdateAppInputSchema)
    .mutation(updateApp),
  getAppDetails: t.procedure
    .use(JWTAssertionTokenFromHeader)
    .use(ValidateJWT)
    .use(LogUsage)
    .input(AppClientIdParamSchema)
    .output(GetAppDetailsOutputSchema)
    .query(getAppDetails),
  getAppProfile: t.procedure
    .use(JWTAssertionTokenFromHeader)
    .use(ValidateJWT)
    .use(LogUsage)
    .input(AppClientIdParamSchema)
    .output(AppUpdateableFieldsSchema)
    .query(getAppProfile),
  listApps: t.procedure
    .use(JWTAssertionTokenFromHeader)
    .use(ValidateJWT)
    .use(LogUsage)
    .input(NoInput)
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
    .mutation(rotateApiKey),
  checkAppAuth: t.procedure
    .use(JWTAssertionTokenFromHeader)
    .use(ValidateJWT)
    .use(LogUsage)
    .input(CheckAppAuthInputSchema)
    .output(CheckAppAuthOutputSchema)
    .query(checkAppAuth),
  publishApp: t.procedure
    .use(JWTAssertionTokenFromHeader)
    .use(ValidateJWT)
    .use(LogUsage)
    .input(PublishAppInputSchema)
    .output(PublishAppOutputSchema)
    .mutation(publishApp),
  checkApiKey: t.procedure
    //This endpoint doesn't require a JWT
    .use(LogUsage)
    .input(CheckApiKeyInputSchema)
    .output(CheckApiKeyOutputSchema)
    .query(checkApiKey),
  getScopes: t.procedure
    //TODO: Revisit when implementing scopes
    .input(NoInput)
    .query(getScopes),
})

export type StarbaseRouter = typeof appRouter
