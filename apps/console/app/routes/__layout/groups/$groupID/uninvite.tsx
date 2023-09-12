import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { redirect, type ActionFunction } from '@remix-run/cloudflare'
import { commitFlashSession, requireJWT } from '~/utilities/session.server'
import createCoreClient from '@proofzero/platform-clients/core'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { BadRequestError } from '@proofzero/errors'
import {
  type IdentityGroupURN,
  IdentityGroupURNSpace,
} from '@proofzero/urns/identity-group'
import { appendToastToFlashSession } from '~/utils/toast.server'
import { ToastType } from '@proofzero/design-system/src/atoms/toast'

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, params, context }) => {
    const jwt = await requireJWT(request, context.env)
    const traceHeader = generateTraceContextHeaders(context.traceSpan)

    const groupID = params.groupID as string
    const identityGroupURN = IdentityGroupURNSpace.urn(
      groupID as string
    ) as IdentityGroupURN

    const fd = await request.formData()
    const invitationCode = fd.get('invitationCode') as string | undefined
    if (!invitationCode) {
      throw new BadRequestError({
        message: 'invitationCode is required',
      })
    }

    const coreClient = createCoreClient(context.env.Core, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    let toastSession
    try {
      await coreClient.identity.deleteIdentityGroupInvitation.mutate({
        identityGroupURN,
        invitationCode,
      })

      toastSession = await appendToastToFlashSession(
        request,
        {
          message: `Succesfully removed invitation`,
          type: ToastType.Success,
        },
        context.env
      )
    } catch (e) {
      toastSession = await appendToastToFlashSession(
        request,
        {
          message: `There was an error removing the invitation`,
          type: ToastType.Error,
        },
        context.env
      )
    }

    return redirect(`/groups/${groupID}`, {
      headers: {
        'Set-Cookie': await commitFlashSession(toastSession, context.env),
      },
    })
  }
)
