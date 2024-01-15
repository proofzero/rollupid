import { initTRPC } from '@trpc/server'

import { errorFormatter } from '@proofzero/utils/trpc'

import type { Context } from '../context'

import {
  ValidateJWT,
  AuthorizationTokenFromHeader,
  RequireIdentity,
} from '@proofzero/platform-middleware/jwt'

import { setAuthorizationNode } from './middleware/setAuthorizationNode'

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

import { getJWKSMethod, GetJWKSMethodOutput } from './methods/getJWKS'

import { LogUsage } from '@proofzero/platform-middleware/log'

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
import {
  preauthorizeMethod,
  PreAuthorizeMethodInput,
  PreAuthorizeMethodOutput,
} from './methods/preauthorize'
import { SetAppDataInput, setAppDataMethod } from './methods/setAppData'
import {
  GetAppDataInput,
  getAppDataMethod,
  GetAppDataOutput,
} from './methods/getAppData'
import {
  GetExternalAppDataInputSchema,
  getExternalAppDataMethod,
  GetExternalAppDataOutputSchema,
} from './methods/getExternalAppData'
import {
  SetExternalAppDataInputSchema,
  setExternalAppDataMethod,
} from './methods/setExternalAppData'

const t = initTRPC.context<Context>().create({ errorFormatter })

export const appRouter = t.router({
  authorize: t.procedure
    .use(LogUsage)
    .input(AuthorizeMethodInput)
    .output(AuthorizeMethodOutput)
    .mutation(authorizeMethod),
  preauthorize: t.procedure
    .use(LogUsage)
    .input(PreAuthorizeMethodInput)
    .output(PreAuthorizeMethodOutput)
    .mutation(preauthorizeMethod),
  exchangeToken: t.procedure
    .use(LogUsage)
    .input(ExchangeTokenMethodInput)
    .output(ExchangeTokenMethodOutput)
    .mutation(exchangeTokenMethod),
  verifyToken: t.procedure
    .use(LogUsage)
    .input(VerifyTokenMethodInput)
    .output(VerifyTokenMethodOutput)
    .query(verifyTokenMethod),
  revokeToken: t.procedure
    .use(AuthorizationTokenFromHeader)
    .use(ValidateJWT)
    .use(RequireIdentity)
    .use(setAuthorizationNode)
    .use(LogUsage)
    .input(RevokeTokenMethodInput)
    .output(RevokeTokenMethodOutput)
    .mutation(revokeTokenMethod),
  revokeAppAuthorization: t.procedure
    .use(AuthorizationTokenFromHeader)
    .use(ValidateJWT)
    .use(LogUsage)
    .input(RevokeAppAuthorizationMethodInput)
    .output(RevokeAppAuthorizationMethodOutput)
    .mutation(revokeAppAuthorizationMethod),
  getUserInfo: t.procedure
    .use(LogUsage)
    .input(GetUserInfoInput)
    .output(GetUserInfoOutput)
    .query(getUserInfoMethod),
  getPersonaData: t.procedure
    .use(LogUsage)
    .input(GetPersonaDataInput)
    .output(GetPersonaDataOutput)
    .query(getPersonaDataMethod),
  getAuthorizedAppScopes: t.procedure
    .use(LogUsage)
    .use(ValidateJWT)
    .input(GetAuthorizedAppScopesMethodInput)
    .output(GetAuthorizedAppScopesMethodOutput)
    .query(getAuthorizedAppScopesMethod),
  getJWKS: t.procedure
    .use(LogUsage)
    .output(GetJWKSMethodOutput)
    .query(getJWKSMethod),
  getAppData: t.procedure
    .use(AuthorizationTokenFromHeader)
    .use(ValidateJWT)
    .use(LogUsage)
    .input(GetAppDataInput)
    .output(GetAppDataOutput)
    .query(getAppDataMethod),
  setAppData: t.procedure
    .use(AuthorizationTokenFromHeader)
    .use(ValidateJWT)
    .use(LogUsage)
    .input(SetAppDataInput)
    .mutation(setAppDataMethod),
  setExternalAppData: t.procedure
    .use(AuthorizationTokenFromHeader)
    .use(ValidateJWT)
    .use(LogUsage)
    .input(SetExternalAppDataInputSchema)
    .mutation(setExternalAppDataMethod),
  getExternalAppData: t.procedure
    .use(AuthorizationTokenFromHeader)
    .use(ValidateJWT)
    .use(LogUsage)
    .input(GetExternalAppDataInputSchema)
    .output(GetExternalAppDataOutputSchema)
    .query(getExternalAppDataMethod),
})
