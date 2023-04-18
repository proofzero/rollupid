import { initTRPC } from '@trpc/server'

import { errorFormatter } from '@proofzero/utils/trpc'

import { Context } from '../context'

import {
  ResolveAccountInput,
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
  getAddressAvatarMethod,
  GetAddressAvatarOutput,
} from './methods/getAddressAvatar'
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
import {
  getAccountByAliasMethod,
  GetAccountByAliasInput,
  GetAccountByAliasOutput,
} from './methods/getAccountByAlias'

import { LogUsage } from '@proofzero/platform-middleware/log'
import { parse3RN } from './middlewares/parse3RN'
import { checkCryptoNodes } from './middlewares/checkCryptoNode'
import { initAddressNode } from './middlewares/initAddressNode'
import { getAccountMethod, GetAccountOutput } from './methods/getAccount'
import {
  InitSmartContractWalletOutput,
  initSmartContractWalletMethod,
} from './methods/initSmartContractWallet'
import { checkOAuthNode } from './middlewares/checkOAuthNode'

import { Analytics } from '@proofzero/platform-middleware/analytics'
import { setAddressNodeClient } from './middlewares/setAddressNodeClient'
import {
  SetAddressNicknameInput,
  setAddressNicknameMethod,
} from './methods/setAddressNickname'
import {
  GenerateEmailOTPInput,
  generateEmailOTPMethod,
  GenerateEmailOTPOutput,
} from './methods/generateEmailOTP'
import {
  VerifyEmailOTPInput,
  verifyEmailOTPMethod,
  VerifyEmailOTPOutput,
} from './methods/verifyEmailOTP'

import {
  deleteAddressNodeMethod,
  DeleteAddressNodeInput,
} from './methods/deleteAddressNode'

const t = initTRPC.context<Context>().create({ errorFormatter })

export const appRouter = t.router({
  resolveAccount: t.procedure
    .use(LogUsage)
    .use(parse3RN)
    .use(checkCryptoNodes)
    .use(checkOAuthNode)
    .use(setAddressNodeClient)
    .use(initAddressNode)
    // .use(injectCustomAnalytics)
    .use(Analytics)
    .input(ResolveAccountInput)
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
  getAccountByAlias: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .input(GetAccountByAliasInput)
    .output(GetAccountByAliasOutput)
    .query(getAccountByAliasMethod),
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
    .mutation(setAccountMethod),
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
  getAddressAvatar: t.procedure
    .use(LogUsage)
    .use(parse3RN)
    .use(checkCryptoNodes)
    .use(checkOAuthNode)
    .use(setAddressNodeClient)
    .use(initAddressNode)
    .use(Analytics)
    .output(GetAddressAvatarOutput)
    .query(getAddressAvatarMethod),
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
  setNickname: t.procedure
    .use(LogUsage)
    .use(parse3RN)
    .use(checkCryptoNodes)
    .use(setAddressNodeClient)
    .use(initAddressNode)
    .use(Analytics)
    .input(SetAddressNicknameInput)
    .query(setAddressNicknameMethod),
  generateEmailOTP: t.procedure
    .use(LogUsage)
    .use(parse3RN)
    .use(setAddressNodeClient)
    .use(Analytics)
    .input(GenerateEmailOTPInput)
    .output(GenerateEmailOTPOutput)
    .mutation(generateEmailOTPMethod),
  verifyEmailOTP: t.procedure
    .use(LogUsage)
    .use(parse3RN)
    .use(setAddressNodeClient)
    .use(Analytics)
    .input(VerifyEmailOTPInput)
    .output(VerifyEmailOTPOutput)
    .mutation(verifyEmailOTPMethod),
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
  initSmartContractWallet: t.procedure
    .use(LogUsage)
    .use(parse3RN)
    .use(checkOAuthNode)
    .use(setAddressNodeClient)
    .use(initAddressNode)
    .output(InitSmartContractWalletOutput)
    .mutation(initSmartContractWalletMethod),
  deleteAddressNode: t.procedure
    .use(LogUsage)
    .use(parse3RN)
    .use(checkCryptoNodes)
    .use(setAddressNodeClient)
    .use(initAddressNode)
    .use(Analytics)
    .input(DeleteAddressNodeInput)
    .mutation(deleteAddressNodeMethod),
})
