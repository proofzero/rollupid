import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { type ActionFunction, json } from '@remix-run/cloudflare'
import { requireJWT } from '~/utilities/session.server'
import createCoreClient from '@proofzero/platform-clients/core'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { BadRequestError } from '@proofzero/errors'
import type {
  CryptoAccountType,
  EmailAccountType,
  OAuthAccountType,
} from '@proofzero/types/account'
import {
  type IdentityGroupURN,
  IdentityGroupURNSpace,
} from '@proofzero/urns/identity-group'

export type InviteRes = {
  inviteCode: string
}

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, params, context }) => {
    const groupID = params.groupID as string
    const groupURN = IdentityGroupURNSpace.urn(
      groupID as string
    ) as IdentityGroupURN

    const jwt = await requireJWT(request, context.env)

    const fd = await request.formData()
    const accountType = fd.get('accountType') as
      | (EmailAccountType | OAuthAccountType | CryptoAccountType)
      | undefined
    if (!accountType) {
      throw new BadRequestError({
        message: 'Type is required',
      })
    }

    const identifier = fd.get('identifier') as string | undefined
    if (!identifier) {
      throw new BadRequestError({
        message: 'Identifier is required',
      })
    }

    const traceHeader = generateTraceContextHeaders(context.traceSpan)
    const coreClient = createCoreClient(context.env.Core, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    const { inviteCode } =
      await coreClient.identity.inviteIdentityGroupMember.mutate({
        identifier,
        accountType: accountType,
        identityGroupURN: groupURN,
      })

    return json({
      inviteCode,
    } as InviteRes)
  }
)
