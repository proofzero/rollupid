import { GrantType } from '@kubelt/platform.access/src/types'
import { AddressType, CryptoAddressType, NodeType } from '@kubelt/types/address'
import { AddressURNSpace } from '@kubelt/urns/address'
import { generateHashedIDRef } from '@kubelt/urns/idref'
import type { LoaderFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'

import { getAccessClient, getAddressClient } from '~/platform.server'
import { createUserSession } from '~/session.server'

export const loader: LoaderFunction = async ({ request, context, params }) => {
  const searchParams = new URL(request.url).searchParams
  const { address } = params
  const node_type = searchParams.get('node_type') as NodeType
  const addr_type = searchParams.get('addr_type') as AddressType
  const state = searchParams.get('state') as string
  const code = searchParams.get('code') as string

  if (!address || !node_type || !addr_type || !code) {
    throw json({ message: 'Invalid params' }, 400)
  }

  const addressURN = AddressURNSpace.componentizedUrn(
    generateHashedIDRef(CryptoAddressType.ETH, address),
    { node_type: node_type, addr_type: addr_type },
    { alias: address }
  )
  const addressClient = getAddressClient(addressURN, context.env)
  const account = await addressClient.resolveAccount.query() // creates and associates account if there is none

  const grantType = GrantType.AuthenticationCode
  const redirectUri = context.env.PASSPORT_REDIRECT_URL
  const clientId = params.address as string

  const accessClient = getAccessClient(context.env)

  // TODO: handle refresh token
  try {
    const { accessToken, refreshToken } =
      await accessClient.exchangeToken.mutate({
        code,
        account,
        clientId,
        redirectUri,
        grantType,
      })

    // TODO: store refresh token in DO and set alarm to refresh

    const {
      clientId: appId,
      redirectUri: consoleAppURI,
      state,
      scope,
    } = context.consoleParams

    const redirectURL =
      appId && consoleAppURI && state
        ? `/authorize?client_id=${clientId}&state=${state}&redirect_uri=${consoleAppURI}&scope=${scope}`
        : `/authorize`
    return createUserSession(accessToken, redirectURL, addressURN, context.env)
  } catch (error) {
    console.error({ addressURN, error: JSON.stringify(error) })
    throw json({ message: 'invalid code' }, 400)
  }
}
