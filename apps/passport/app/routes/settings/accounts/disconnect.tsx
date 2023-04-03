import { AddressURN } from '@proofzero/urns/address'
import type { ActionFunction } from '@remix-run/cloudflare'
import { getAddressClient } from '~/platform.server'
import { getJWTConditionallyFromSession } from '~/session.server'

export const action: ActionFunction = async ({ request, context }) => {
  const jwt = getJWTConditionallyFromSession(request, context.env)
  const formData = await request.formData()

  const id = formData.get('id') as AddressURN

  const addressClient = getAddressClient(id, context.env, context.traceSpan)
  const accountURN = await addressClient.getAccount.query()

  try {
    await addressClient.unsetAccount.mutate(accountURN)
  } catch (ex) {
    console.error(ex)
  }

  return null
}
