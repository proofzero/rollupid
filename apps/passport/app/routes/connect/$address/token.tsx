import { GrantType } from '@kubelt/types/access'
import type { AddressType, NodeType } from '@kubelt/types/address'
import { CryptoAddressType } from '@kubelt/types/address'
import { AddressURNSpace } from '@kubelt/urns/address'
import { generateHashedIDRef } from '@kubelt/urns/idref'
import type { LoaderFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'

import { getAddressClient } from '~/platform.server'
import { getConsoleParamsSession } from '~/session.server'
import { authenticateAddress } from '~/utils/authenticate.server'

export const loader: LoaderFunction = async ({ request, context, params }) => {
  const searchParams = new URL(request.url).searchParams
  const { address } = params
  const node_type = searchParams.get('node_type') as NodeType
  const addr_type = searchParams.get('addr_type') as AddressType
  const code = searchParams.get('code') as string

  if (!address || !node_type || !addr_type || !code) {
    throw json({ message: 'Invalid params' }, 400)
  }

  const addressURN = AddressURNSpace.componentizedUrn(
    generateHashedIDRef(CryptoAddressType.ETH, address),
    { node_type: node_type, addr_type: addr_type },
    { alias: address }
  )

  const addressClient = await getAddressClient(addressURN, context.env, request)
  const account = await addressClient.resolveAccount.query()

  const appData = await getConsoleParamsSession(request, context.env)
    .then((session) => JSON.parse(session.get('params')))
    .catch((err) => {
      console.log('No console params session found', err)
      return null
    })

  return authenticateAddress(addressURN, account, appData, context.env)
}
