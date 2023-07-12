import type { ActionFunction } from '@remix-run/cloudflare'
import { getAddressClient } from '~/platform.server'
import {
  getDefaultAuthzParams,
  getValidatedSessionContext,
} from '~/session.server'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { posthogCall } from '@proofzero/utils/posthog'

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const { accountUrn } = await getValidatedSessionContext(
      request,
      getDefaultAuthzParams(request),
      context.env,
      context.traceSpan
    )

    const formData = await request.formData()

    const id = formData.get('id') as string
    const name = formData.get('name') as string

    const addressClient = getAddressClient(id, context.env, context.traceSpan)

    await addressClient.setNickname.query({
      nickname: name,
    })

    await posthogCall({
      apiKey: context.env.SECRET_POSTHOG_API_KEY,
      distinctId: accountUrn,
      eventName: 'address_renamed',
      properties: {
        addressId: id,
        nickname: name,
      },
    })

    return null
  }
)
