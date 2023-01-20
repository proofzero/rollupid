import { initTRPC } from '@trpc/server'

import { Context } from '../context'

import {
  resolveAccountMethod,
  ResolveAccountOutput,
} from './methods/resolveAccount'
import {
  setAccountMethod,
  SetAccountInput,
  SetAccountOutput,
} from './methods/setAccount'
import {
  unsetAccountMethod,
  UnsetAccountInput,
  UnsetAccountOutput,
} from './methods/unsetAccount'
import {
  getAddressProfileMethod,
  GetAddressProfileOutput,
} from './methods/getAddressProfile'
import {
  getNonceMethod,
  GetNonceInput,
  GetNonceOutput,
} from './methods/getNonce'
import {
  verifyNonceMethod,
  VerifyNonceInput,
  VerifyNonceOutput,
} from './methods/verifyNonce'
import { getOAuthDataMethod, GetOAuthDataOutput } from './methods/getOAuthData'
import { setOAuthDataMethod, SetOAuthDataInput } from './methods/setOAuthData'

import { LogUsage } from '@kubelt/platform-middleware/log'
import { parse3RN } from './middlewares/parse3RN'
import { checkCryptoNodes } from './middlewares/checkCryptoNode'
import { initAddressNode } from './middlewares/initAddressNode'
import { getAccountMethod, GetAccountOutput } from './methods/getAccount'
import { InitVaultOutput, initVaultMethod } from './methods/initVault'
import { checkOAuthNode } from './middlewares/checkOAuthNode'

import { Analytics, CustomAnalyticsFunctionType } from '@kubelt/platform-middleware/analytics'
import { setAddressNodeClient } from './middlewares/setAddressNodeClient'

const t = initTRPC.context<Context>().create()

export const injectCustomAnalytics = t.middleware(async ({ctx, next}) => {
  const CustomAnalyticsFunction: CustomAnalyticsFunctionType = () => {
    return {
      blobs: [
        'test custom blob1',
        'test custom long blob this will cause popping blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1test custom blob1',
        'test custom blob2',
        'test custom blob3',
        'test custom blob4',
        'test custom blob5',
        'test custom blob6',
        'test custom blob7',
        'test custom blob8',
        'test custom blob9',
        'test custom blob10',
        'test custom blob11',
        'test custom blob12',
        'test custom blob13',
        'test custom blob14',
        'test custom blob15',
        'test custom blob16',
        'test custom blob17',
        'test custom blob18',
        'test custom blob19',
        'test custom blob20',
        'test custom blob21',
      ],
      doubles: [
        0.01,
        0.02,
        0.03,
        0.04,
        0.05,
        0.06,
        0.07,
        0.08,
        0.09,
        0.10,
        0.11,
        0.12,
        0.13,
        0.14,
        0.15,
        0.16,
        0.17,
        0.18,
        0.19,
        0.20,
        0.21,
      ],
      indexes: ['test custom index1', 'test custom index2'],
    } as AnalyticsEngineDataPoint
  }

  return next({
    ctx: {
      CustomAnalyticsFunction,
      ...ctx,
    },
  })
})

export const appRouter = t.router({
  resolveAccount: t.procedure
    .use(LogUsage)
    .use(parse3RN)
    .use(checkCryptoNodes)
    .use(checkOAuthNode)
    .use(setAddressNodeClient)
    .use(initAddressNode)
    .use(injectCustomAnalytics)
    .use(Analytics)
    .output(ResolveAccountOutput)
    .query(resolveAccountMethod),
  getAccount: t.procedure
    .use(LogUsage)
    .use(parse3RN)
    .use(checkCryptoNodes)
    .use(checkOAuthNode)
    .use(setAddressNodeClient)
    .use(initAddressNode)
    .use(Analytics)
    .output(GetAccountOutput)
    .query(getAccountMethod),
  setAccount: t.procedure
    .use(LogUsage)
    .use(parse3RN)
    .use(checkCryptoNodes)
    .use(checkOAuthNode)
    .use(setAddressNodeClient)
    .use(initAddressNode)
    .use(Analytics)
    .input(SetAccountInput)
    .output(SetAccountOutput)
    .query(setAccountMethod),
  unsetAccount: t.procedure
    .use(LogUsage)
    .use(parse3RN)
    .use(checkCryptoNodes)
    .use(checkOAuthNode)
    .use(setAddressNodeClient)
    .use(initAddressNode)
    .use(Analytics)
    .input(UnsetAccountInput)
    .output(UnsetAccountOutput)
    .mutation(unsetAccountMethod),
  getAddressProfile: t.procedure
    .use(LogUsage)
    .use(parse3RN)
    .use(checkCryptoNodes)
    .use(checkOAuthNode)
    .use(setAddressNodeClient)
    .use(initAddressNode)
    .use(Analytics)
    .output(GetAddressProfileOutput)
    .query(getAddressProfileMethod),
  getNonce: t.procedure
    .use(LogUsage)
    .use(parse3RN)
    .use(checkCryptoNodes)
    .use(setAddressNodeClient)
    .use(Analytics)
    .input(GetNonceInput)
    .output(GetNonceOutput)
    .query(getNonceMethod),
  verifyNonce: t.procedure
    .use(LogUsage)
    .use(parse3RN)
    .use(checkCryptoNodes)
    .use(setAddressNodeClient)
    .use(Analytics)
    .input(VerifyNonceInput)
    .output(VerifyNonceOutput)
    .mutation(verifyNonceMethod),
  getOAuthData: t.procedure
    .use(LogUsage)
    .use(parse3RN)
    .use(checkOAuthNode)
    .use(setAddressNodeClient)
    .use(initAddressNode)
    .use(Analytics)
    .output(GetOAuthDataOutput)
    .query(getOAuthDataMethod),
  setOAuthData: t.procedure
    .use(LogUsage)
    .use(parse3RN)
    .use(checkOAuthNode)
    .use(setAddressNodeClient)
    .use(initAddressNode)
    .use(Analytics)
    .input(SetOAuthDataInput)
    .mutation(setOAuthDataMethod),
  initVault: t.procedure
    .use(LogUsage)
    .use(parse3RN)
    .use(checkOAuthNode)
    .use(setAddressNodeClient)
    .use(initAddressNode)
    .output(InitVaultOutput)
    .mutation(initVaultMethod),
})
