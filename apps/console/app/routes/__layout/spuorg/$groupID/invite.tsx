import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { ActionFunction, json } from '@remix-run/cloudflare'
import { requireJWT } from '~/utilities/session.server'
import createCoreClient from '@proofzero/platform-clients/core'
import {
  getAuthzHeaderConditionallyFromToken,
  parseJwt,
} from '@proofzero/utils'
import { BadRequestError } from '@proofzero/errors'
import {
  CryptoAddressType,
  EmailAddressType,
  OAuthAddressType,
} from '@proofzero/types/address'
import {
  IdentityGroupURN,
  IdentityGroupURNSpace,
} from '@proofzero/urns/identity-group'
import { createAnalyticsEvent } from '@proofzero/utils/analytics'
import { type AccountURN } from '@proofzero/urns/account'
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
    const parsedJwt = parseJwt(jwt!)
    const accountURN = parsedJwt.sub as AccountURN

    const fd = await request.formData()
    const addressType = fd.get('addressType') as
      | (EmailAddressType | OAuthAddressType | CryptoAddressType)
      | undefined
    if (!addressType) {
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
      await coreClient.account.inviteIdentityGroupMember.mutate({
        inviterAccountURN: accountURN,
        identifier,
        addressType: addressType,
        identityGroupURN: groupURN,
      })

    await createAnalyticsEvent({
      eventName: 'member_invited_to_group',
      distinctId: accountURN,
      apiKey: context.env.POSTHOG_API_KEY,
      groups: {
        group: groupID,
      },
      properties: {
        groupID: groupID,
      },
    })

    return json({
      inviteCode,
    } as InviteRes)
  }
)
