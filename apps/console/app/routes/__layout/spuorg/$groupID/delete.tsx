import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { ActionFunction, redirect } from '@remix-run/cloudflare'
import { commitFlashSession, requireJWT } from '~/utilities/session.server'
import createCoreClient from '@proofzero/platform-clients/core'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import {
  IdentityGroupURN,
  IdentityGroupURNSpace,
} from '@proofzero/urns/identity-group'
import { appendToastToFlashSession } from '~/utils/toast.server'
import { ToastType } from '@proofzero/design-system/src/atoms/toast'

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context, params }) => {
    const groupID = params.groupID as string
    const groupURN = IdentityGroupURNSpace.urn(
      groupID as string
    ) as IdentityGroupURN

    const jwt = await requireJWT(request, context.env)
    const traceHeader = generateTraceContextHeaders(context.traceSpan)

    const coreClient = createCoreClient(context.env.Core, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    let toastSession

    try {
      await coreClient.identity.deleteIdentityGroup.mutate(groupURN)

      toastSession = await appendToastToFlashSession(
        request,
        {
          message: `Succesfully deleted group`,
          type: ToastType.Success,
        },
        context.env
      )
    } catch (e) {
      toastSession = await appendToastToFlashSession(
        request,
        {
          message: `There was an error deleting the group`,
          type: ToastType.Error,
        },
        context.env
      )
    }

    return redirect('/spuorg', {
      headers: {
        'Set-Cookie': await commitFlashSession(toastSession, context.env),
      },
    })
  }
)
