import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { ActionFunction, redirect } from '@remix-run/cloudflare'
import { requireJWT } from '~/utilities/session.server'
import createCoreClient from '@proofzero/platform-clients/core'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import {
  IdentityGroupURN,
  IdentityGroupURNSpace,
} from '@proofzero/urns/identity-group'
import { BadRequestError } from '@proofzero/errors'
import { AccountURN } from '@proofzero/urns/account'

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context, params }) => {
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

    const jwt = await requireJWT(request, context.env)
    const traceHeader = generateTraceContextHeaders(context.traceSpan)

    const coreClient = createCoreClient(context.env.Core, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    if (purge) {
      await coreClient.account.deleteIdentityGroup.mutate(groupURN)

      return redirect('/spuorg')
    }

    await coreClient.account.deleteIdentityGroupMembership.mutate({
      accountURN: accountURN as AccountURN,
      identityGroupURN: groupURN,
    })

    return redirect(`/spuorg/${groupID}`)
  }
)
