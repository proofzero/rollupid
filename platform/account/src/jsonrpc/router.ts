import { initTRPC } from '@trpc/server'

import { errorFormatter } from '@proofzero/utils/trpc'

import type { Context } from '../context'

import {
  getProfileMethod,
  GetProfileInput,
  GetProfileOutput,
  GetProfileBatchInput,
  GetProfileBatchOutput,
  getProfileBatchMethod,
} from './methods/getProfile'
import { setProfileMethod, SetProfileInput } from './methods/setProfile'
import {
  getOwnAddressesMethod,
  GetAddressesInput,
} from './methods/getOwnAddresses'
import {
  hasAddressesMethod,
  HasAddressesInput,
  HasAddressesOutput,
} from './methods/hasAddresses'

import { getAddressesMethod } from './methods/getAddresses'

import {
  ValidateJWT,
  AuthorizationTokenFromHeader,
} from '@proofzero/platform-middleware/jwt'
import { LogUsage } from '@proofzero/platform-middleware/log'
import { Scopes } from '@proofzero/platform-middleware/scopes'

import { initAccountNodeByName } from '../nodes'
import { Analytics } from '@proofzero/platform-middleware/analytics'
import { getPublicAddressesMethod } from './methods/getPublicAddresses'
import {
  GetAuthorizedAppsMethodInput,
  GetAuthorizedAppsMethodOutput,
  getAuthorizedAppsMethod,
} from './methods/getAuthorizedApps'
import { isValidMethod, IsValidOutput } from './methods/isValid'
import {
  DeleteAccountNodeInput,
  deleteAccountNodeMethod,
} from './methods/deleteAccountNode'
import { UnauthorizedError } from '@proofzero/errors'
import {
  GetEntitlementsInputSchema,
  GetEntitlementsOutputSchema,
  getEntitlements,
} from './methods/getEntitlements'
import {
  UpdateEntitlementsInputSchema,
  updateEntitlements,
} from './methods/updateEntitlements'
import {
  GetStripPaymentDataInputSchema,
  GetStripePaymentDataOutputSchema,
  SetStripePaymentDataInputSchema,
  getStripePaymentData,
  setStripePaymentData,
} from './methods/stripePaymentData'
import {
  CancelServicePlansInput,
  cancelServicePlans,
} from './methods/cancelServicePlans'
import {
  CreateIdentityGroupInputSchema,
  createIdentityGroup,
} from './methods/identity-groups/createIdentityGroup'
import {
  ListIdentityGroupsOutputSchema,
  listIdentityGroups,
} from './methods/identity-groups/listIdentityGroups'
import {
  InviteIdentityGroupMemberInputSchema,
  inviteIdentityGroupMember,
} from './methods/identity-groups/inviteIdentityGroupMember'
import {
  GetIdentityGroupMemberInvitationsInputSchema,
  GetIdentityGroupMemberInvitationsOutputSchema,
  getIdentityGroupMemberInvitations,
} from './methods/identity-groups/getIdentityGroupMemberInvitations'
import {
  GetIdentityGroupMemberInvitationDetailsInputSchema,
  GetIdentityGroupMemberInvitationDetailsOutputSchema,
  getIdentityGroupMemberInvitationDetails,
} from './methods/identity-groups/getIdentityGroupMemberInvitationDetails'

import {
  AcceptIdentityGroupMemberInvitationInputSchema,
  acceptIdentityGroupMemberInvitation,
} from './methods/identity-groups/acceptIdentityGroupMemberInvitation'
import {
  DeleteIdentityGroupMembershipInputSchema,
  deleteIdentityGroupMembership,
} from './methods/identity-groups/deleteIdentityGroupMembership'
import {
  DeleteIdentityGroupInputSchema,
  deleteIdentityGroup,
} from './methods/identity-groups/deleteIdentityGroup'

const t = initTRPC.context<Context>().create({ errorFormatter })

export const injectAccountNode = t.middleware(async ({ ctx, next }) => {
  const accountURN = ctx.accountURN

  if (!accountURN)
    throw new UnauthorizedError({ message: 'No accountURN in context' })

  const accountNode = await initAccountNodeByName(accountURN, ctx.Account)

  return next({
    ctx: {
      accountNode,
      ...ctx,
    },
  })
})

export const appRouter = t.router({
  getProfile: t.procedure
    .use(Scopes)
    .use(LogUsage)
    .use(Analytics)
    .input(GetProfileInput)
    .output(GetProfileOutput)
    .query(getProfileMethod),
  setProfile: t.procedure
    .use(AuthorizationTokenFromHeader)
    .use(ValidateJWT)
    .use(Scopes)
    .use(injectAccountNode)
    .use(LogUsage)
    .use(Analytics)
    .input(SetProfileInput)
    .mutation(setProfileMethod),
  isValid: t.procedure
    .use(AuthorizationTokenFromHeader)
    .use(ValidateJWT)
    .use(injectAccountNode)
    .use(LogUsage)
    .use(Analytics)
    .output(IsValidOutput)
    .query(isValidMethod),
  getAddresses: t.procedure
    .use(AuthorizationTokenFromHeader)
    .use(ValidateJWT)
    .use(Scopes)
    .use(LogUsage)
    .use(Analytics)
    .input(GetAddressesInput)
    // .output(AddressListSchema)
    .query(getAddressesMethod),
  getOwnAddresses: t.procedure
    .use(AuthorizationTokenFromHeader)
    .use(ValidateJWT)
    .use(Scopes)
    .use(LogUsage)
    .use(Analytics)
    .input(GetAddressesInput)
    // .output(AddressListSchema)
    .query(getOwnAddressesMethod),
  getPublicAddresses: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .input(GetAddressesInput)
    // .output(AddressListSchema)
    .query(getPublicAddressesMethod),
  hasAddresses: t.procedure
    .use(AuthorizationTokenFromHeader)
    .use(ValidateJWT)
    .use(Scopes)
    .use(LogUsage)
    .use(Analytics)
    .input(HasAddressesInput)
    .output(HasAddressesOutput)
    .mutation(hasAddressesMethod),
  getAuthorizedApps: t.procedure
    .use(AuthorizationTokenFromHeader)
    .use(ValidateJWT)
    .use(Scopes)
    .use(LogUsage)
    .input(GetAuthorizedAppsMethodInput)
    .output(GetAuthorizedAppsMethodOutput)
    .query(getAuthorizedAppsMethod),
  deleteAccountNode: t.procedure
    .use(AuthorizationTokenFromHeader)
    .use(ValidateJWT)
    .use(injectAccountNode)
    .use(LogUsage)
    .input(DeleteAccountNodeInput)
    .mutation(deleteAccountNodeMethod),
  getEntitlements: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .input(GetEntitlementsInputSchema)
    .output(GetEntitlementsOutputSchema)
    .query(getEntitlements),
  updateEntitlements: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .input(UpdateEntitlementsInputSchema)
    .mutation(updateEntitlements),
  getStripePaymentData: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .input(GetStripPaymentDataInputSchema)
    .output(GetStripePaymentDataOutputSchema)
    .query(getStripePaymentData),
  setStripePaymentData: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .input(SetStripePaymentDataInputSchema)
    .mutation(setStripePaymentData),
  cancelServicePlans: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .input(CancelServicePlansInput)
    .mutation(cancelServicePlans),
  createIdentityGroup: t.procedure
    .use(AuthorizationTokenFromHeader)
    .use(ValidateJWT)
    .use(LogUsage)
    .use(Analytics)
    .input(CreateIdentityGroupInputSchema)
    .mutation(createIdentityGroup),
  listIdentityGroups: t.procedure
    .use(AuthorizationTokenFromHeader)
    .use(ValidateJWT)
    .use(LogUsage)
    .use(Analytics)
    .output(ListIdentityGroupsOutputSchema)
    .query(listIdentityGroups),
  inviteIdentityGroupMember: t.procedure
    .use(AuthorizationTokenFromHeader)
    .use(ValidateJWT)
    .use(LogUsage)
    .use(Analytics)
    .input(InviteIdentityGroupMemberInputSchema)
    .mutation(inviteIdentityGroupMember),
  getIdentityGroupMemberInvitations: t.procedure
    .use(AuthorizationTokenFromHeader)
    .use(ValidateJWT)
    .use(LogUsage)
    .use(Analytics)
    .input(GetIdentityGroupMemberInvitationsInputSchema)
    .output(GetIdentityGroupMemberInvitationsOutputSchema)
    .query(getIdentityGroupMemberInvitations),
  getIdentityGroupMemberInvitationDetails: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .input(GetIdentityGroupMemberInvitationDetailsInputSchema)
    .output(GetIdentityGroupMemberInvitationDetailsOutputSchema)
    .query(getIdentityGroupMemberInvitationDetails),
  acceptIdentityGroupMemberInvitation: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .use(AuthorizationTokenFromHeader)
    .use(ValidateJWT)
    .use(injectAccountNode)
    .input(AcceptIdentityGroupMemberInvitationInputSchema)
    .mutation(acceptIdentityGroupMemberInvitation),
  getProfileBatch: t.procedure
    .use(Scopes)
    .use(LogUsage)
    .use(Analytics)
    .input(GetProfileBatchInput)
    .output(GetProfileBatchOutput)
    .query(getProfileBatchMethod),
  deleteIdentityGroup: t.procedure
    .use(AuthorizationTokenFromHeader)
    .use(ValidateJWT)
    .use(LogUsage)
    .use(Analytics)
    .input(DeleteIdentityGroupInputSchema)
    .mutation(deleteIdentityGroup),
  deleteIdentityGroupMembership: t.procedure
    .use(AuthorizationTokenFromHeader)
    .use(ValidateJWT)
    .use(LogUsage)
    .use(Analytics)
    .input(DeleteIdentityGroupMembershipInputSchema)
    .query(deleteIdentityGroupMembership),
})
