import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { AccountURN } from '@proofzero/urns/account'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { ActionFunction, redirect } from '@remix-run/cloudflare'
import { parseJwt, requireJWT } from '~/utilities/session.server'
import createCoreClient from '@proofzero/platform-clients/core'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { BadRequestError } from '@proofzero/errors'

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const jwt = await requireJWT(request, context.env)
    const parsedJwt = parseJwt(jwt!)
    const accountURN = parsedJwt.sub as AccountURN

    const traceHeader = generateTraceContextHeaders(context.traceSpan)

    const coreClient = createCoreClient(context.env.Core, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    const fd = await request.formData()
    const name = fd.get('name')
    if (!name) {
      throw new BadRequestError({
        message: 'Name is required',
      })
    }

    await coreClient.account.createIdentityGroup.mutate({
      accountURN,
      name: name as string,
    })

    return redirect('/spuorg')
  }
)
