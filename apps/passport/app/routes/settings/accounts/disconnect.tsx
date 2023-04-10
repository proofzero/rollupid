import { ERROR_CODES, RollupError } from '@proofzero/errors'
import { AddressURN } from '@proofzero/urns/address'
import type { ActionFunction } from '@remix-run/cloudflare'
import { getAddressClient } from '~/platform.server'
import {
  getValidatedSessionContext,
  getDefaultConsoleParams,
} from '~/session.server'

export const action: ActionFunction = async ({ request, context }) => {
  await getValidatedSessionContext(
    request,
    getDefaultConsoleParams(request),
    context.env,
    context.traceSpan
  )

  const formData = await request.formData()

  const id = formData.get('id') as AddressURN
  const primaryAddressURN = formData.get('primaryAddressURN') as AddressURN

  if (id === primaryAddressURN) {
    throw new RollupError({
      code: ERROR_CODES.BAD_REQUEST,
      message: 'Cannot disconnect primary address',
    })
  }

  const addressClient = getAddressClient(id, context.env, context.traceSpan)
  const accountURN = await addressClient.getAccount.query()

  try {
    await addressClient.unsetAccount.mutate(accountURN)
  } catch (ex) {
    console.error(ex)
  }

  return null
}
