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
  getOwnAccountsMethod,
  GetAccountsInput,
} from './methods/getOwnAccounts'
import {
  hasAccountsMethod,
  HasAccountsInput,
  HasAccountsOutput,
} from './methods/hasAccounts'

import { getAccountsMethod } from './methods/getAccounts'

import {
  ValidateJWT,
  AuthorizationTokenFromHeader,
  RequireIdentity,
} from '@proofzero/platform-middleware/jwt'
import { LogUsage } from '@proofzero/platform-middleware/log'
import { Scopes } from '@proofzero/platform-middleware/scopes'

import { initIdentityNodeByName } from '../nodes'
import { Analytics } from '@proofzero/platform-middleware/analytics'
import { getPublicAccountsMethod } from './methods/getPublicAccounts'
import {
  GetAuthorizedAppsMethodInput,
  GetAuthorizedAppsMethodOutput,
  getAuthorizedAppsMethod,
} from './methods/getAuthorizedApps'
import { isValidMethod, IsValidOutput } from './methods/isValid'
import {
  DeleteIdentityNodeInput,
  deleteIdentityNodeMethod,
} from './methods/deleteIdentityNode'
import { UnauthorizedError } from '@proofzero/errors'
import {
  CreateIdentityGroupInputSchema,
  CreateIdentityGroupOutputSchema,
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
import { purgeIdentityGroupMemberships } from './methods/identity-groups/purgeIdentityGroupMemberships'
import {
  HasIdentityGroupPermissionsInputSchema,
  HasIdentityGroupPermissionsOutputSchema,
  hasIdentityGroupPermissions,
} from './methods/identity-groups/hasIdentityGroupPermissions'
import {
  DeleteIdentityGroupInvitationInputSchema,
  deleteIdentityGroupInvitation,
} from './methods/identity-groups/deleteIdentityGroupInvitation'
import {
  ListPaymentFailedIdentityGroupsOutputSchema,
  listPaymentFailedIdentityGroups,
} from './methods/identity-groups/listPaymentFailedIdentityGroups'
import {
  PatchProfileFieldsInputSchema,
  patchProfileFieldsMethod,
} from './methods/patchProfileFields'
import { resetProfileFieldsMethod } from './methods/resetProfileFields'
import { mergeMethod, MergeInput, MergeOutput } from './methods/merge'
import {
  mergePreviewMethod,
  MergePreviewInput,
  MergePreviewOutput,
} from './methods/merge-preview'

const t = initTRPC.context<Context>().create({ errorFormatter })

export const injectIdentityNode = t.middleware(async ({ ctx, next }) => {
  const identityURN = ctx.identityURN

  if (!identityURN)
    throw new UnauthorizedError({ message: 'No identityURN in context' })

  let identityNode = initIdentityNodeByName(identityURN, ctx.env.Identity)
  const forwardIdentityURN = await identityNode.class.getForwardIdentityURN()
  if (forwardIdentityURN)
    identityNode = initIdentityNodeByName(forwardIdentityURN, ctx.env.Identity)

  return next({
    ctx: {
      identityNode,
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
    .use(injectIdentityNode)
    .use(LogUsage)
    .use(Analytics)
    .input(SetProfileInput)
    .mutation(setProfileMethod),
  isValid: t.procedure
    .use(AuthorizationTokenFromHeader)
    .use(ValidateJWT)
    .use(injectIdentityNode)
    .use(LogUsage)
    .use(Analytics)
    .output(IsValidOutput)
    .query(isValidMethod),
  getAccounts: t.procedure
    .use(AuthorizationTokenFromHeader)
    .use(ValidateJWT)
    .use(Scopes)
    .use(LogUsage)
    .use(Analytics)
    .input(GetAccountsInput)
    // .output(AccountListSchema)
    .query(getAccountsMethod),
  getOwnAccounts: t.procedure
    .use(AuthorizationTokenFromHeader)
    .use(ValidateJWT)
    .use(Scopes)
    .use(LogUsage)
    .use(Analytics)
    .input(GetAccountsInput)
    // .output(AccountListSchema)
    .query(getOwnAccountsMethod),
  getPublicAccounts: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .input(GetAccountsInput)
    // .output(AccountListSchema)
    .query(getPublicAccountsMethod),
  hasAccounts: t.procedure
    .use(AuthorizationTokenFromHeader)
    .use(ValidateJWT)
    .use(Scopes)
    .use(LogUsage)
    .use(Analytics)
    .input(HasAccountsInput)
    .output(HasAccountsOutput)
    .mutation(hasAccountsMethod),
  getAuthorizedApps: t.procedure
    .use(AuthorizationTokenFromHeader)
    .use(ValidateJWT)
    .use(Scopes)
    .use(LogUsage)
    .input(GetAuthorizedAppsMethodInput)
    .output(GetAuthorizedAppsMethodOutput)
    .query(getAuthorizedAppsMethod),
  deleteIdentityNode: t.procedure
    .use(AuthorizationTokenFromHeader)
    .use(ValidateJWT)
    .use(injectIdentityNode)
    .use(LogUsage)
    .input(DeleteIdentityNodeInput)
    .mutation(deleteIdentityNodeMethod),
  createIdentityGroup: t.procedure
    .use(AuthorizationTokenFromHeader)
    .use(ValidateJWT)
    .use(LogUsage)
    .use(Analytics)
    .input(CreateIdentityGroupInputSchema)
    .output(CreateIdentityGroupOutputSchema)
    .mutation(createIdentityGroup),
  listIdentityGroups: t.procedure
    .use(AuthorizationTokenFromHeader)
    .use(ValidateJWT)
    .use(LogUsage)
    .use(Analytics)
    .output(ListIdentityGroupsOutputSchema)
    .query(listIdentityGroups),
  listPaymentFailedIdentityGroups: t.procedure
    .use(AuthorizationTokenFromHeader)
    .use(ValidateJWT)
    .use(LogUsage)
    .use(Analytics)
    .output(ListPaymentFailedIdentityGroupsOutputSchema)
    .query(listPaymentFailedIdentityGroups),
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
    .use(RequireIdentity)
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
    .use(LogUsage)
    .use(Analytics)
    .use(AuthorizationTokenFromHeader)
    .use(ValidateJWT)
    .use(RequireIdentity)
    .input(DeleteIdentityGroupInputSchema)
    .mutation(deleteIdentityGroup),
  deleteIdentityGroupMembership: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .use(AuthorizationTokenFromHeader)
    .use(ValidateJWT)
    .use(RequireIdentity)
    .input(DeleteIdentityGroupMembershipInputSchema)
    .mutation(deleteIdentityGroupMembership),
  purgeIdentityGroupMemberships: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .use(AuthorizationTokenFromHeader)
    .use(ValidateJWT)
    .use(RequireIdentity)
    .mutation(purgeIdentityGroupMemberships),
  hasIdentityGroupPermissions: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .input(HasIdentityGroupPermissionsInputSchema)
    .output(HasIdentityGroupPermissionsOutputSchema)
    .query(hasIdentityGroupPermissions),
  deleteIdentityGroupInvitation: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .use(AuthorizationTokenFromHeader)
    .use(ValidateJWT)
    .use(RequireIdentity)
    .input(DeleteIdentityGroupInvitationInputSchema)
    .mutation(deleteIdentityGroupInvitation),
  patchProfileFields: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .use(AuthorizationTokenFromHeader)
    .use(ValidateJWT)
    .use(RequireIdentity)
    .use(injectIdentityNode)
    .input(PatchProfileFieldsInputSchema)
    .mutation(patchProfileFieldsMethod),
  resetProfileFields: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .use(AuthorizationTokenFromHeader)
    .use(ValidateJWT)
    .use(RequireIdentity)
    .use(injectIdentityNode)
    .mutation(resetProfileFieldsMethod),
  merge: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .use(AuthorizationTokenFromHeader)
    .use(ValidateJWT)
    .use(RequireIdentity)
    .use(injectIdentityNode)
    .input(MergeInput)
    .output(MergeOutput)
    .mutation(mergeMethod),
  mergePreview: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .use(AuthorizationTokenFromHeader)
    .use(ValidateJWT)
    .use(RequireIdentity)
    .use(injectIdentityNode)
    .input(MergePreviewInput)
    .output(MergePreviewOutput)
    .query(mergePreviewMethod),
})
