import { GrantType } from '@kubelt/platform.access/src/types'
import type { LoaderFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'

import {
  getAccessClient,
  getAddressClient,
  getGalaxyClient,
} from '~/platform.server'
import { createUserSession } from '~/session.server'

export const loader: LoaderFunction = async ({ request, context, params }) => {
  const searchParams = new URL(request.url).searchParams
  const { address } = params
  const node_type = searchParams.get('node_type') as string
  const addr_type = searchParams.get('addr_type') as string
  const state = searchParams.get('state') as string
  const code = searchParams.get('code') as string

  if (!address || !node_type || !addr_type || !code) {
    throw json({ message: 'Invalid params' }, 400)
  }

  // TODO exchange token for access token
  const addressClient = getAddressClient(
    address as string,
    node_type,
    addr_type
  )
  const account = await addressClient.kb_resolveAccount()
  const accessClient = getAccessClient()
  const { accessToken, refreshToken } = await accessClient.kb_exchangeToken(
    GrantType.AuthenticationCode,
    code,
    PASSPORT_REDIRECT_URL,
    params.address as string, // as client_id
    account as string // as client_secret
  )

  const galaxyClient = await getGalaxyClient()
  console.log('get profile from address')
  await galaxyClient.getProfileFromAddress({
    address,
    nodeType: node_type,
    addrType: addr_type,
  }) // lazy try to upgrade to profile in new account

  // TODO: store refresh token in DO and set alarm to refresh

  const redirectURL = searchParams.get('client_id')
    ? `/authorize?client_id=${searchParams.get('client_id')}&state=${state}`
    : THREEID_APP_URL

  const defaultProfileURN = `urn:threeid:address/${params.address}?+node_type=${node_type}&addr_type=${addr_type}`
  return createUserSession(accessToken, redirectURL, defaultProfileURN)
}
