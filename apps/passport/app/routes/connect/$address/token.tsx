import type { AddressType, NodeType } from '@proofzero/types/address'
import { CryptoAddressType } from '@proofzero/types/address'
import { AddressURNSpace } from '@proofzero/urns/address'
import { generateHashedIDRef } from '@proofzero/urns/idref'
import type { LoaderFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'
import { getConsoleParams } from '~/session.server'

import { getAddressClient } from '../../../platform.server'
import { authenticateAddress } from '../../../utils/authenticate.server'

export const loader: LoaderFunction = async ({ request, context, params }) => {
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

  const addressClient = getAddressClient(
    addressURN,
    context.env,
    context.traceSpan
  )
  const accountURN = await addressClient.getAccount.query()

  const appData = await getConsoleParams(request, context.env)

  return authenticateAddress(
    addressURN,
    accountURN,
    appData,
    context.env,
    context.traceSpan
  )
}
