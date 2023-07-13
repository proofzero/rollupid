import { initTRPC } from '@trpc/server'

import { errorFormatter } from '@proofzero/utils/trpc'

import type { Context } from '../context'

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
  getAddressAvatarMethod,
  GetAddressAvatarOutput,
} from './methods/getAddressAvatar'
import {
  GetAddressProfileBatchInput,
  getAddressProfileBatchMethod,
  GetAddressProfileBatchOutput,
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
import {
  getAccountMethod,
  GetAccountInput,
  GetAccountOutput,
} from './methods/getAccount'
import {
  InitSmartContractWalletInput,
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
import {
  getAddressReferenceTypes,
  GetAddressReferenceTypeOutput,
} from './methods/getAddressReferenceTypes'
import {
  registerSessionKeyMethod,
  RegisterSessionKeyInput,
  RegisterSessionKeyOutput,
} from './methods/registerWalletSessionKey'
import {
  RevokeWalletSessionKeyInput,
  RevokeWalletSessionKeyBatchInput,
  revokeWalletSessionKeyMethod,
  revokeWalletSessionKeyBatchMethod,
} from './methods/revokeWalletSessionKey'
import {
  SendBillingNotificationInput,
  sendBillingNotificationMethod,
} from './methods/sendBillingNotification'
import {
  SendReconciliationNotificationInput,
  sendReconciliationNotificationMethod,
} from './methods/sendReconciliationNotificationMethod'
import {
  SendFailedPaymentNotificationInput,
  sendFailedPaymentNotificationMethod,
} from './methods/sendFailedPaymentNotification'
import {
  sendSuccessfulPaymentNotificationMethod,
  SendSuccessfulPaymentNotificationInput,
} from './methods/sendSuccessfulPaymentNotification'
import {
  GetAddressURNForEmailInputSchema,
  getAddressURNForEmailMethod,
  GetAddressURNForEmailOutputSchema,
} from './methods/getAddressURNForEmail'

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
    .input(GetAccountInput)
    .output(GetAccountOutput)
    .query(getAccountMethod),
  getAccountByAlias: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .input(GetAccountByAliasInput)
    .output(GetAccountByAliasOutput)
    .query(getAccountByAliasMethod),
  registerSessionKey: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .input(RegisterSessionKeyInput)
    .output(RegisterSessionKeyOutput)
    .mutation(registerSessionKeyMethod),
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
  getAddressProfileBatch: t.procedure
    .use(LogUsage)
    .use(parse3RN)
    .use(checkCryptoNodes)
    .use(checkOAuthNode)
    .use(setAddressNodeClient)
    .use(initAddressNode)
    .use(Analytics)
    .input(GetAddressProfileBatchInput)
    .output(GetAddressProfileBatchOutput)
    .query(getAddressProfileBatchMethod),
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
    .use(setAddressNodeClient)
    .input(InitSmartContractWalletInput)
    .output(InitSmartContractWalletOutput)
    .query(initSmartContractWalletMethod),
  deleteAddressNode: t.procedure
    .use(LogUsage)
    .use(parse3RN)
    .use(checkCryptoNodes)
    .use(setAddressNodeClient)
    .use(initAddressNode)
    .use(Analytics)
    .input(DeleteAddressNodeInput)
    .mutation(deleteAddressNodeMethod),
  getAddressReferenceTypes: t.procedure
    .use(LogUsage)
    .use(parse3RN)
    .use(Analytics)
    .output(GetAddressReferenceTypeOutput)
    .query(getAddressReferenceTypes),
  revokeWalletSessionKey: t.procedure
    .use(LogUsage)
    .use(parse3RN)
    .use(Analytics)
    .input(RevokeWalletSessionKeyInput)
    .mutation(revokeWalletSessionKeyMethod),
  revokeWalletSessionKeyBatch: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .input(RevokeWalletSessionKeyBatchInput)
    .mutation(revokeWalletSessionKeyBatchMethod),
  sendBillingNotification: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .input(SendBillingNotificationInput)
    .mutation(sendBillingNotificationMethod),
  sendReconciliationNotification: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .input(SendReconciliationNotificationInput)
    .query(sendReconciliationNotificationMethod),
  sendFailedPaymentNotification: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .input(SendFailedPaymentNotificationInput)
    .mutation(sendFailedPaymentNotificationMethod),
  sendSuccessfulPaymentNotification: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .input(SendSuccessfulPaymentNotificationInput)
    .mutation(sendSuccessfulPaymentNotificationMethod),
  getAddressURNForEmail: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .input(GetAddressURNForEmailInputSchema)
    .output(GetAddressURNForEmailOutputSchema)
    .query(getAddressURNForEmailMethod),
})
