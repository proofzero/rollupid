import type { ActionFunction } from '@remix-run/cloudflare'
import { getAddressClient } from '~/platform.server'
import {
  getDefaultConsoleParams,
  getValidatedSessionContext,
} from '~/session.server'

export const action: ActionFunction = async ({ request, context }) => {
  await getValidatedSessionContext(
    request,
    getDefaultConsoleParams(request),
    context.env,
    context.traceSpan
  )

  const formData = await request.formData()
  const addressURN = formData.get('addressURN') as string
  const addressClient = getAddressClient(
    addressURN,
    context.env,
    context.traceSpan
  )

  return addressClient.getAddressUsage.query()
}
