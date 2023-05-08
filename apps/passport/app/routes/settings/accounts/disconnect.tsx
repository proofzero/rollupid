import { AddressURN } from '@proofzero/urns/address'
import { JsonError } from '@proofzero/utils/errors'
import type { ActionFunction } from '@remix-run/cloudflare'
import { getAddressClient } from '~/platform.server'
import {
  getValidatedSessionContext,
  getDefaultAuthzParams,
} from '~/session.server'

export const action: ActionFunction = async ({ request, context }) => {
  try {
    await getValidatedSessionContext(
      request,
      getDefaultAuthzParams(request),
      context.env,
      context.traceSpan
    )

    const formData = await request.formData()
    const id = formData.get('id') as AddressURN

    const addressClient = getAddressClient(id, context.env, context.traceSpan)
    const accountURN = await addressClient.getAccount.query()

    await addressClient.deleteAddressNode.mutate({
      accountURN,
    })

    return null
  } catch (ex) {
    throw JsonError(ex)
  }
}
