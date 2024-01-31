import { AccountURN } from '@proofzero/urns/account'
import { JsonError } from '@proofzero/utils/errors'
import type { ActionFunction } from '@remix-run/cloudflare'
import { getCoreClient } from '~/platform.server'
import {
  getValidatedSessionContext,
  getDefaultAuthzParams,
} from '~/session.server'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    await getValidatedSessionContext(
      request,
      getDefaultAuthzParams(request),
      context.env,
      context.traceSpan
    )

    const formData = await request.formData()
    const accountURN = formData.get('id') as AccountURN

    const coreClient = getCoreClient({ context, accountURN })
    const identityURN = await coreClient.account.getIdentity.query()

    await coreClient.account.deleteAccountNode.mutate({ identityURN })

    return null
  }
)
