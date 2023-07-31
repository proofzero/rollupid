import type { ActionFunction } from '@remix-run/cloudflare'
import { getCoreClient } from '~/platform.server'
import {
  getDefaultAuthzParams,
  getValidatedSessionContext,
} from '~/session.server'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { createAnalyticsEvent } from '@proofzero/utils/analytics'

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const { identityURN } = await getValidatedSessionContext(
      request,
      getDefaultAuthzParams(request),
      context.env,
      context.traceSpan
    )

    const formData = await request.formData()
    const name = formData.get('name') as string
    const accountURN = formData.get('id') as string
    const coreClient = getCoreClient({ context, accountURN })

    await coreClient.account.setNickname.query({
      nickname: name,
    })

    await createAnalyticsEvent({
      apiKey: context.env.POSTHOG_API_KEY,
      distinctId: identityURN,
      eventName: 'account_renamed',
      properties: {
        accountId: accountURN,
        nickname: name,
      },
    })

    return null
  }
)
