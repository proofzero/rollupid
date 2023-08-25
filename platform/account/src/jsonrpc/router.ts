import { initTRPC } from '@trpc/server'

import { errorFormatter } from '@proofzero/utils/trpc'

import type { Context } from '../context'

import {
  ResolveIdentityInput,
  resolveIdentityMethod,
  ResolveIdentityOutput,
} from './methods/resolveIdentity'
import {
  setIdentityMethod,
  SetIdentityInput,
  SetIdentityOutput,
} from './methods/setIdentity'
import {
  getAccountAvatarMethod,
  GetAccountAvatarOutput,
} from './methods/getAccountAvatar'
import {
  GetAccountProfileBatchInput,
  getAccountProfileBatchMethod,
  GetAccountProfileBatchOutput,
  getAccountProfileMethod,
  GetAccountProfileOutput,
} from './methods/getAccountProfile'
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
  getIdentityByAliasMethod,
  GetIdentityByAliasInput,
  GetIdentityByAliasOutput,
} from './methods/getIdentityByAlias'
import { LogUsage } from '@proofzero/platform-middleware/log'
import { parse3RN } from './middlewares/parse3RN'
import { checkCryptoNodes } from './middlewares/checkCryptoNode'
import { initAccountNode } from './middlewares/initAccountNode'
import {
  getIdentityMethod,
  GetIdentityInput,
  GetIdentityOutput,
} from './methods/getIdentity'
import {
  InitSmartContractWalletInput,
  InitSmartContractWalletOutput,
  initSmartContractWalletMethod,
} from './methods/initSmartContractWallet'
import { checkOAuthNode } from './middlewares/checkOAuthNode'

import { Analytics } from '@proofzero/platform-middleware/analytics'
import { setAccountNodeClient } from './middlewares/setAccountNodeClient'
import {
  SetAccountNicknameInput,
  setAccountNicknameMethod,
} from './methods/setAccountNickname'
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
  deleteAccountNodeMethod,
  DeleteAccountNodeInput,
} from './methods/deleteAccountNode'
import {
  getAccountReferenceTypes,
  GetAccountReferenceTypeOutput,
} from './methods/getAccountReferenceTypes'
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
  GetAccountURNForEmailInputSchema,
  getAccountURNForEmailMethod,
  GetAccountURNForEmailOutputSchema,
} from './methods/getAccountURNForEmail'
import { checkWebauthnNode } from './middlewares/checkWebauthnNode'

const t = initTRPC.context<Context>().create({ errorFormatter })

export const appRouter = t.router({
  resolveIdentity: t.procedure
    .use(LogUsage)
    .use(parse3RN)
    .use(checkCryptoNodes)
    .use(checkOAuthNode)
    .use(setAccountNodeClient)
    .use(initAccountNode)
    // .use(injectCustomAnalytics)
    .use(Analytics)
    .input(ResolveIdentityInput)
    .output(ResolveIdentityOutput)
    .query(resolveIdentityMethod),
  getIdentity: t.procedure
    .use(LogUsage)
    .use(parse3RN)
    .use(checkCryptoNodes)
    .use(checkOAuthNode)
    .use(setAccountNodeClient)
    .use(initAccountNode)
    .use(Analytics)
    .input(GetIdentityInput)
    .output(GetIdentityOutput)
    .query(getIdentityMethod),
  getIdentityByAlias: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .input(GetIdentityByAliasInput)
    .output(GetIdentityByAliasOutput)
    .query(getIdentityByAliasMethod),
  registerSessionKey: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .input(RegisterSessionKeyInput)
    .output(RegisterSessionKeyOutput)
    .mutation(registerSessionKeyMethod),
  setIdentity: t.procedure
    .use(LogUsage)
    .use(parse3RN)
    .use(checkCryptoNodes)
    .use(checkOAuthNode)
    .use(setAccountNodeClient)
    .use(initAccountNode)
    .use(Analytics)
    .input(SetIdentityInput)
    .output(SetIdentityOutput)
    .mutation(setIdentityMethod),
  getAccountAvatar: t.procedure
    .use(LogUsage)
    .use(parse3RN)
    .use(checkCryptoNodes)
    .use(checkOAuthNode)
    .use(setAccountNodeClient)
    .use(initAccountNode)
    .use(Analytics)
    .output(GetAccountAvatarOutput)
    .query(getAccountAvatarMethod),
  getAccountProfile: t.procedure
    .use(LogUsage)
    .use(parse3RN)
    .use(checkCryptoNodes)
    .use(checkOAuthNode)
    .use(setAccountNodeClient)
    .use(initAccountNode)
    .use(Analytics)
    .output(GetAccountProfileOutput)
    .query(getAccountProfileMethod),
  getAccountProfileBatch: t.procedure
    .use(LogUsage)
    .use(parse3RN)
    .use(checkCryptoNodes)
    .use(checkOAuthNode)
    .use(setAccountNodeClient)
    .use(initAccountNode)
    .use(Analytics)
    .input(GetAccountProfileBatchInput)
    .output(GetAccountProfileBatchOutput)
    .query(getAccountProfileBatchMethod),
  setNickname: t.procedure
    .use(LogUsage)
    .use(parse3RN)
    .use(checkCryptoNodes)
    .use(setAccountNodeClient)
    .use(initAccountNode)
    .use(Analytics)
    .input(SetAccountNicknameInput)
    .query(setAccountNicknameMethod),
  generateEmailOTP: t.procedure
    .use(LogUsage)
    .use(parse3RN)
    .use(setAccountNodeClient)
    .use(Analytics)
    .input(GenerateEmailOTPInput)
    .output(GenerateEmailOTPOutput)
    .mutation(generateEmailOTPMethod),
  verifyEmailOTP: t.procedure
    .use(LogUsage)
    .use(parse3RN)
    .use(setAccountNodeClient)
    .use(Analytics)
    .input(VerifyEmailOTPInput)
    .output(VerifyEmailOTPOutput)
    .mutation(verifyEmailOTPMethod),
  getNonce: t.procedure
    .use(LogUsage)
    .use(parse3RN)
    .use(checkCryptoNodes)
    .use(setAccountNodeClient)
    .use(Analytics)
    .input(GetNonceInput)
    .output(GetNonceOutput)
    .query(getNonceMethod),
  verifyNonce: t.procedure
    .use(LogUsage)
    .use(parse3RN)
    .use(checkCryptoNodes)
    .use(setAccountNodeClient)
    .use(Analytics)
    .input(VerifyNonceInput)
    .output(VerifyNonceOutput)
    .mutation(verifyNonceMethod),
  getOAuthData: t.procedure
    .use(LogUsage)
    .use(parse3RN)
    .use(checkOAuthNode)
    .use(setAccountNodeClient)
    .use(initAccountNode)
    .use(Analytics)
    .output(GetOAuthDataOutput)
    .query(getOAuthDataMethod),
  setOAuthData: t.procedure
    .use(LogUsage)
    .use(parse3RN)
    .use(checkOAuthNode)
    .use(setAccountNodeClient)
    .use(initAccountNode)
    .use(Analytics)
    .input(SetOAuthDataInput)
    .mutation(setOAuthDataMethod),
  initSmartContractWallet: t.procedure
    .use(LogUsage)
    .use(parse3RN)
    .use(setAccountNodeClient)
    .input(InitSmartContractWalletInput)
    .output(InitSmartContractWalletOutput)
    .query(initSmartContractWalletMethod),
  deleteAccountNode: t.procedure
    .use(LogUsage)
    .use(parse3RN)
    .use(checkCryptoNodes)
    .use(setAccountNodeClient)
    .use(initAccountNode)
    .use(Analytics)
    .input(DeleteAccountNodeInput)
    .mutation(deleteAccountNodeMethod),
  getAccountReferenceTypes: t.procedure
    .use(LogUsage)
    .use(parse3RN)
    .use(Analytics)
    .output(GetAccountReferenceTypeOutput)
    .query(getAccountReferenceTypes),
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
  getAccountURNForEmail: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .input(GetAccountURNForEmailInputSchema)
    .output(GetAccountURNForEmailOutputSchema)
    .query(getAccountURNForEmailMethod),
})
