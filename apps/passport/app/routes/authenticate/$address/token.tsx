import { GrantType } from '@kubelt/types/access'
import { AddressType, CryptoAddressType, NodeType } from '@kubelt/types/address'
import { AddressURNSpace } from '@kubelt/urns/address'
import { generateHashedIDRef } from '@kubelt/urns/idref'
import type { LoaderFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'

import { getAccessClient } from '~/platform.server'
import { createUserSession, getConsoleParamsSession } from '~/session.server'

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

  const grantType = GrantType.AuthenticationCode
  const redirectUri = context.env.PASSPORT_REDIRECT_URL
  const clientId = params.address as string

  const accessClient = getAccessClient(context.env)

  // TODO: handle refresh token
  const { accessToken, refreshToken } = await accessClient.exchangeToken
    .mutate({
      code,
      clientId,
      redirectUri,
      grantType,
    })
    .catch((err) => {
      console.error('Error exchanging token', err)
      throw json({ message: `Error exchanging token: ${err}` }, 400)
    })

  // TODO: store refresh token in DO and set alarm to refresh

  const appData = await getConsoleParamsSession(request, context.env)
    .then((session) => JSON.parse(session.get('params')))
    .catch((err) => {
      console.log('No console params session found', err)
      return null
    })

  let redirectURL = `/authorize`
  if (appData) {
    const {
      clientId: appId,
      redirectUri: consoleAppURI,
      state: appState,
      scope,
    } = appData

    const appParams = new URLSearchParams({
      client_id: appId,
      state: appState,
      redirect_uri: consoleAppURI,
      scope,
    })

    redirectURL += `?${appParams}}`
  }

  return createUserSession(accessToken, redirectURL, addressURN, context.env)
}
