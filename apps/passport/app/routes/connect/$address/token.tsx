import type { AddressType, NodeType } from '@proofzero/types/address'
import { CryptoAddressType } from '@proofzero/types/address'
import { AddressURNSpace } from '@proofzero/urns/address'
import { generateHashedIDRef } from '@proofzero/urns/idref'
import type { LoaderFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'
import { getAuthzCookieParams } from '~/session.server'

import { getCoreClient } from '../../../platform.server'
import { authenticateAddress } from '../../../utils/authenticate.server'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context, params }) => {
    const searchParams = new URL(request.url).searchParams
    const { address } = params
    const node_type = searchParams.get('node_type') as NodeType
    const addr_type = searchParams.get('addr_type') as AddressType

    if (!address || !node_type || !addr_type) {
      throw json({ message: 'Invalid params' }, 400)
    }

    const addressURN = AddressURNSpace.componentizedUrn(
      generateHashedIDRef(CryptoAddressType.ETH, address),
      { node_type: node_type, addr_type: addr_type },
      { alias: address, hidden: 'false' }
    )

    const coreClient = getCoreClient({ context, addressURN })
    const accountURN = await coreClient.address.getAccount.query()

    const appData = await getAuthzCookieParams(request, context.env)

    return authenticateAddress(
      addressURN,
      accountURN,
      appData,
      request,
      context.env,
      context.traceSpan
    )
  }
)
