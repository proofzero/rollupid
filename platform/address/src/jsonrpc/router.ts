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
    .query(unsetAccountMethod),
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
    .use(setOAuthNodeClient)
    .use(initCryptoNode)
    .use(initOAuthNode)
    .input(GetNonceInput)
    .output(GetNonceOutput)
    .query(getNonceMethod),
  verifyNonce: t.procedure
    .use(LogUsage)
    .use(parse3RN)
    .use(checkCryptoNodes)
    .use(resolveENS)
    .use(setCryptoNodeClient)
    .use(setOAuthNodeClient)
    .use(initCryptoNode)
    .use(initOAuthNode)
    .input(VerifyNonceInput)
    .output(VerifyNonceOutput)
    .query(verifyNonceMethod),
  getOAuthData: t.procedure
    .use(LogUsage)
    .use(parse3RN)
    .use(checkCryptoNodes)
    .use(resolveENS)
    .use(setCryptoNodeClient)
    .use(setOAuthNodeClient)
    .use(initCryptoNode)
    .use(initOAuthNode)
    .output(GetOAuthDataOutput)
    .query(getOAuthDataMethod),
  setOAuthData: t.procedure
    .use(LogUsage)
    .use(parse3RN)
    .use(checkCryptoNodes)
    .use(resolveENS)
    .use(setCryptoNodeClient)
    .use(setOAuthNodeClient)
    .use(initCryptoNode)
    .use(initOAuthNode)
    .input(SetOAuthDataInput)
    .query(setOAuthDataMethod),
})
