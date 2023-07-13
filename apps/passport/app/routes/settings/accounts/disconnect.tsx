import { AddressURN } from '@proofzero/urns/address'
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
    const addressURN = formData.get('id') as AddressURN

    const coreClient = getCoreClient({ context, addressURN })
    const accountURN = await coreClient.address.getAccount.query()

    await coreClient.address.deleteAddressNode.mutate({ accountURN })

    return null
  }
)
