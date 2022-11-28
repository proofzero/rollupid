import { GrantType } from '@kubelt/platform.access/src/types'
import type { LoaderFunction } from '@remix-run/cloudflare'
import { getAccessClient, getAddressClient } from '~/platform.server'
import { createUserSession } from '~/session.server'

export const loader: LoaderFunction = async ({ request, context, params }) => {
  const searchParams = new URL(request.url).searchParams
  const { address } = params
  const node_type = searchParams.get('node_type') as string
  const addr_type = searchParams.get('addr_type') as string

  // TODO validate params
  // code
  // address
  // node
  // type

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
    searchParams.get('code') as string,
    PASSPORT_REDIRECT_URL,
    params.address as string, // as client_id
    account as string // as client_secret
  )

  // TODO: store refresh token in DO and set alarm to refresh

  console.log('accessToken', accessToken)
  const redirectURL = searchParams.get('client_id')
    ? `/authorize?client_id=${searchParams.get('client_id')}`
    : THREEID_APP_URL

  return createUserSession(accessToken, redirectURL, params.address)
}
