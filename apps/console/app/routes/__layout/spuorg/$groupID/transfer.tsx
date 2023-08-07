import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { ActionFunction, json, redirect } from '@remix-run/cloudflare'
import { commitFlashSession, requireJWT } from '~/utilities/session.server'
import createCoreClient from '@proofzero/platform-clients/core'
import {
  getAuthzHeaderConditionallyFromToken,
  parseJwt,
} from '@proofzero/utils'
import { BadRequestError } from '@proofzero/errors'
import {
  IdentityGroupURN,
  IdentityGroupURNSpace,
} from '@proofzero/urns/identity-group'
import { createAnalyticsEvent } from '@proofzero/utils/analytics'
import { type AccountURN } from '@proofzero/urns/account'
import { appendToastToFlashSession } from '~/utils/toast.server'
import { ToastType } from '@proofzero/design-system/src/atoms/toast'
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
    const clientID = fd.get('clientID')
    if (!clientID) {
      throw new BadRequestError({
        message: 'clientID is required',
      })
    }

    const traceHeader = generateTraceContextHeaders(context.traceSpan)
    const coreClient = createCoreClient(context.env.Core, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    await coreClient.starbase.transferAppToGroup.mutate({
      identityGroupURN: groupURN,
      clientID: clientID as string,
    })

    await createAnalyticsEvent({
      eventName: 'app_transferred_to_group',
      distinctId: accountURN,
      apiKey: context.env.POSTHOG_API_KEY,
      groups: {
        group: groupID,
      },
      properties: {
        groupID: groupID,
        clientID: clientID,
      },
    })

    const toastSession = await appendToastToFlashSession(
      request,
      {
        message: `Succesfully transferred application`,
        type: ToastType.Success,
      },
      context.env
    )

    return redirect(`/spuorg/${groupID}`, {
      headers: {
        'Set-Cookie': await commitFlashSession(toastSession, context.env),
      },
    })
  }
)
