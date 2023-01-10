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
import { resolveENS } from './middlewares/resolveENS'
import { setCryptoNodeClient } from './middlewares/setCryptoNodeClient'
import { setOAuthNodeClient } from './middlewares/setOAuthNodeClient'
import { initCryptoNode } from './middlewares/initCryptoNode'
import { initOAuthNode } from './middlewares/initOAuthNode'
import { getVoucherMethod, GetVoucherOutput } from './methods/getVoucher'
import { SetVoucherInput, setVoucherMethod } from './methods/setVoucher'
import { getAccountMethod, GetAccountOutput } from './methods/getAccount'
import { InitVaultOutput, initVaultMethod } from './methods/initVault'

const t = initTRPC.context<Context>().create()

export const appRouter = t.router({
  resolveAccount: t.procedure
    .use(LogUsage)
    .use(parse3RN)
    .use(checkCryptoNodes)
    .use(resolveENS)
    .use(setCryptoNodeClient)
    .use(setOAuthNodeClient)
    .use(initCryptoNode)
    .use(initOAuthNode)
    .output(ResolveAccountOutput)
    .query(resolveAccountMethod),
  getAccount: t.procedure
    .use(LogUsage)
    .use(parse3RN)
    .use(checkCryptoNodes)
    .use(resolveENS)
    .use(setCryptoNodeClient)
    .use(setOAuthNodeClient)
    .use(initCryptoNode)
    .use(initOAuthNode)
    .output(GetAccountOutput)
    .query(getAccountMethod),
  setAccount: t.procedure
    .use(LogUsage)
    .use(parse3RN)
    .use(checkCryptoNodes)
    .use(resolveENS)
    .use(setCryptoNodeClient)
    .use(setOAuthNodeClient)
    .use(initCryptoNode)
    .use(initOAuthNode)
    .input(SetAccountInput)
    .output(SetAccountOutput)
    .query(setAccountMethod),
  unsetAccount: t.procedure
    .use(LogUsage)
    .use(parse3RN)
    .use(checkCryptoNodes)
    .use(resolveENS)
    .use(setCryptoNodeClient)
    .use(setOAuthNodeClient)
    .use(initCryptoNode)
    .use(initOAuthNode)
    .input(UnsetAccountInput)
    .output(UnsetAccountOutput)
    .mutation(unsetAccountMethod),
  getAddressProfile: t.procedure
    .use(LogUsage)
    .use(parse3RN)
    .use(checkCryptoNodes)
    .use(resolveENS)
    .use(setCryptoNodeClient)
    .use(setOAuthNodeClient)
    .use(initCryptoNode)
    .use(initOAuthNode)
    .output(GetAddressProfileOutput)
    .query(getAddressProfileMethod),
  getNonce: t.procedure
    .use(LogUsage)
    .use(parse3RN)
    .use(checkCryptoNodes)
    .use(resolveENS)
    .use(setCryptoNodeClient)
    .use(initCryptoNode)
    .input(GetNonceInput)
    .output(GetNonceOutput)
    .query(getNonceMethod),
  verifyNonce: t.procedure
    .use(LogUsage)
    .use(parse3RN)
    .use(checkCryptoNodes)
    .use(resolveENS)
    .use(setCryptoNodeClient)
    .use(initCryptoNode)
    .input(VerifyNonceInput)
    .output(VerifyNonceOutput)
    .mutation(verifyNonceMethod),
  getOAuthData: t.procedure
    .use(LogUsage)
    .use(parse3RN)
    .use(resolveENS)
    .use(setOAuthNodeClient)
    .use(initOAuthNode)
    .output(GetOAuthDataOutput)
    .query(getOAuthDataMethod),
  setOAuthData: t.procedure
    .use(LogUsage)
    .use(parse3RN)
    .use(setCryptoNodeClient)
    .use(setOAuthNodeClient)
    .use(initOAuthNode)
    .input(SetOAuthDataInput)
    .mutation(setOAuthDataMethod),
  getVoucher: t.procedure
    .use(LogUsage)
    .use(parse3RN)
    .use(checkCryptoNodes)
    .use(resolveENS)
    .use(setCryptoNodeClient)
    .use(initCryptoNode)
    .output(GetVoucherOutput)
    .query(getVoucherMethod),
  setVoucher: t.procedure
    .use(LogUsage)
    .use(parse3RN)
    .use(checkCryptoNodes)
    .use(resolveENS)
    .use(setCryptoNodeClient)
    .use(initCryptoNode)
    .input(SetVoucherInput)
    .mutation(setVoucherMethod),
  initVault: t.procedure
    .use(LogUsage)
    .use(parse3RN)
    .use(setCryptoNodeClient)
    .use(setOAuthNodeClient)
    .use(initOAuthNode)
    .output(InitVaultOutput)
    .mutation(initVaultMethod),
})
