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
import { BadRequestError } from '@proofzero/errors'
import { AccountURN } from '@proofzero/urns/account'
import { appendToastToFlashSession } from '~/utils/toast.server'
import { ToastType } from '@proofzero/design-system/src/atoms/toast'

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context, params }) => {
    const jwt = await requireJWT(request, context.env)
    const traceHeader = generateTraceContextHeaders(context.traceSpan)

    const groupID = params.groupID as string
    const groupURN = IdentityGroupURNSpace.urn(
      groupID as string
    ) as IdentityGroupURN

    const fd = await request.formData()
    const accountURN = fd.get('accountURN')
    if (!accountURN) {
      throw new BadRequestError({
        message: 'accountURN is required',
      })
    }

    const purge = Boolean(fd.get('purge'))

    const coreClient = createCoreClient(context.env.Core, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    let toastSession
    try {
      if (purge) {
        await coreClient.account.deleteIdentityGroup.mutate(groupURN)

        toastSession = await appendToastToFlashSession(
          request,
          {
            message: `Succesfully purged group`,
            type: ToastType.Success,
          },
          context.env
        )

        return redirect('/spuorg', {
          headers: {
            'Set-Cookie': await commitFlashSession(toastSession, context.env),
          },
        })
      }

      await coreClient.account.deleteIdentityGroupMembership.mutate({
        accountURN: accountURN as AccountURN,
        identityGroupURN: groupURN,
      })

      toastSession = await appendToastToFlashSession(
        request,
        {
          message: `Succesfully removed member`,
          type: ToastType.Success,
        },
        context.env
      )
    } catch (e) {
      toastSession = await appendToastToFlashSession(
        request,
        {
          message: `There was an error removing the member`,
          type: ToastType.Error,
        },
        context.env
      )
    }

    return redirect(`/spuorg/${groupID}`, {
      headers: {
        'Set-Cookie': await commitFlashSession(toastSession, context.env),
      },
    })
  }
)
