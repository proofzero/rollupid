import { initTRPC } from '@trpc/server'

import { errorFormatter } from '@proofzero/utils/trpc'

import { Context } from './context'
import { LogUsage } from '@proofzero/platform-middleware/log'
import {
  createApp,
  CreateAppInputSchema,
  CreateAppOutputSchema,
} from './methods/createApp'
import {
  AuthorizationTokenFromHeader,
  ValidateJWT,
} from '@proofzero/platform-middleware/jwt'
import { deleteApp, DeleteAppInput } from './methods/deleteApp'
import {
  getAppDetails,
  GetAppDetailsInput,
  GetAppDetailsOutput,
} from './methods/getAppDetails'
import { listApps, ListAppsOutput } from './methods/listApps'
import {
  rotateClientSecret,
  RotateClientSecretInput,
  RotateClientSecretOutput,
} from './methods/rotateClientSecret'
import {
  rotateApiKey,
  RotateApiKeyInput,
  RotateApiKeyOutput,
} from './methods/rotateApiKey'
import {
  checkAppAuth,
  CheckAppAuthInput,
  CheckAppAuthOutput,
} from './methods/checkAppAuth'
import {
  publishApp,
  PublishAppInput,
  PublishAppOutput,
} from './methods/publishApp'
import {
  getAppProfile,
  GetAppProfileInput,
  GetAppProfileOutput,
} from './methods/getAppProfile'
import { updateApp, UpdateAppInput } from './methods/updateApp'
import {
  checkApiKey,
  CheckApiKeyInput,
  CheckApiKeyOutput,
} from './methods/checkApiKey'
import { getScopes } from './methods/getScopes'
import { NoInput } from '@proofzero/platform-middleware/inputValidators'

import { Analytics } from '@proofzero/platform-middleware/analytics'
import { OwnAppsMiddleware } from './ownAppsMiddleware'
import {
  getAppPublicProps,
  GetAppPublicPropsInput,
  GetAppPublicPropsOutput,
} from './methods/getAppPublicProps'
import { getAuthorizedAccounts } from './methods/getAuthorizedAccounts'
import {
  GetAuthorizedAccountsMethodInput,
  GetAuthorizedAccountsMethodOutput,
} from './methods/getAuthorizedAccounts'
import {
  getAppContactAddress,
  GetAppContactAddressInput,
  GetAppContactAddressOutput,
} from './methods/getAppContactAddress'
import {
  upsertAppContactAddress,
  UpsertAppContactAddressInput,
} from './methods/upsertAppContactAddress'
import {
  getPaymaster,
  GetPaymasterInput,
  GetPaymasterOutput,
} from './methods/getPaymaster'
import { setPaymaster, SetPaymasterInput } from './methods/setPaymaster'
import { ApiKeyExtractMiddleware } from './apiKeyExtract'

const t = initTRPC.context<Context>().create({ errorFormatter })

export const appRouter = t.router({
  createApp: t.procedure
    .use(AuthorizationTokenFromHeader)
    .use(ValidateJWT)
    .use(LogUsage)
    .use(Analytics)
    .input(CreateAppInputSchema)
    .output(CreateAppOutputSchema)
    .mutation(createApp),
  deleteApp: t.procedure
    .use(AuthorizationTokenFromHeader)
    .use(ValidateJWT)
    .use(LogUsage)
    .use(Analytics)
    .use(OwnAppsMiddleware)
    .input(DeleteAppInput)
    .mutation(deleteApp),
  updateApp: t.procedure
    .use(AuthorizationTokenFromHeader)
    .use(ValidateJWT)
    .use(LogUsage)
    .use(Analytics)
    .use(OwnAppsMiddleware)
    .input(UpdateAppInput)
    .mutation(updateApp),
  setPaymaster: t.procedure
    .use(AuthorizationTokenFromHeader)
    .use(ValidateJWT)
    .use(LogUsage)
    .use(Analytics)
    .use(OwnAppsMiddleware)
    .input(SetPaymasterInput)
    .mutation(setPaymaster),
  getPaymaster: t.procedure
    .use(AuthorizationTokenFromHeader)
    .use(ValidateJWT)
    .use(LogUsage)
    .use(Analytics)
    .use(ApiKeyExtractMiddleware)
    .use(OwnAppsMiddleware)
    .input(GetPaymasterInput)
    .output(GetPaymasterOutput)
    .query(getPaymaster),
  getAppDetails: t.procedure
    .use(AuthorizationTokenFromHeader)
    .use(ValidateJWT)
    .use(LogUsage)
    .use(Analytics)
    .use(OwnAppsMiddleware)
    .input(GetAppDetailsInput)
    .output(GetAppDetailsOutput)
    .query(getAppDetails),
  getAppProfile: t.procedure
    .use(AuthorizationTokenFromHeader)
    .use(ValidateJWT)
    .use(LogUsage)
    .use(Analytics)
    .use(OwnAppsMiddleware)
    .input(GetAppProfileInput)
    .output(GetAppProfileOutput)
    .query(getAppProfile),
  getAuthorizedAccounts: t.procedure
    .use(AuthorizationTokenFromHeader)
    .use(ValidateJWT)
    .use(LogUsage)
    .use(Analytics)
    .use(OwnAppsMiddleware)
    .input(GetAuthorizedAccountsMethodInput)
    .output(GetAuthorizedAccountsMethodOutput)
    .query(getAuthorizedAccounts),
  listApps: t.procedure
    .use(AuthorizationTokenFromHeader)
    .use(ValidateJWT)
    .use(LogUsage)
    .use(Analytics)
    .use(OwnAppsMiddleware)
    .input(NoInput)
    .output(ListAppsOutput)
    .query(listApps),
  rotateClientSecret: t.procedure
    .use(AuthorizationTokenFromHeader)
    .use(ValidateJWT)
    .use(LogUsage)
    .use(Analytics)
    .use(OwnAppsMiddleware)
    .input(RotateClientSecretInput)
    .output(RotateClientSecretOutput)
    .mutation(rotateClientSecret),
  rotateApiKey: t.procedure
    .use(AuthorizationTokenFromHeader)
    .use(ValidateJWT)
    .use(LogUsage)
    .use(Analytics)
    .use(OwnAppsMiddleware)
    .input(RotateApiKeyInput)
    .output(RotateApiKeyOutput)
    .mutation(rotateApiKey),
  checkAppAuth: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .input(CheckAppAuthInput)
    .output(CheckAppAuthOutput)
    .query(checkAppAuth),
  getAppPublicProps: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .input(GetAppPublicPropsInput)
    .output(GetAppPublicPropsOutput)
    .query(getAppPublicProps),
  publishApp: t.procedure
    .use(AuthorizationTokenFromHeader)
    .use(ValidateJWT)
    .use(LogUsage)
    .use(Analytics)
    .use(OwnAppsMiddleware)
    .input(PublishAppInput)
    .output(PublishAppOutput)
    .mutation(publishApp),
  checkApiKey: t.procedure
    //This endpoint doesn't require a JWT
    .use(LogUsage)
    .use(Analytics)
    .input(CheckApiKeyInput)
    .output(CheckApiKeyOutput)
    .query(checkApiKey),
  getScopes: t.procedure
    //TODO: Revisit when implementing scopes
    .use(Analytics)
    .input(NoInput)
    .query(getScopes),
  getAppContactAddress: t.procedure
    .use(AuthorizationTokenFromHeader)
    .use(ValidateJWT)
    .use(LogUsage)
    .use(Analytics)
    .use(OwnAppsMiddleware)
    .input(GetAppContactAddressInput)
    .output(GetAppContactAddressOutput)
    .query(getAppContactAddress),
  upsertAppContactAddress: t.procedure
    .use(AuthorizationTokenFromHeader)
    .use(ValidateJWT)
    .use(LogUsage)
    .use(Analytics)
    .use(OwnAppsMiddleware)
    .input(UpsertAppContactAddressInput)
    .mutation(upsertAppContactAddress),
})

export type StarbaseRouter = typeof appRouter
