import type { ActionFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'
import createAccessClient from '@kubelt/platform-clients/access'
import { GrantType } from '@kubelt/platform.access/src/types'

export const action: ActionFunction = async ({ request, context }) => {
  const formData = await request.formData()
  const clientId = formData.get('client_id') as string
  const clientSecret = formData.get('client_secret') as string
  const code = formData.get('code') as string
  const refreshToken = formData.get('refresh_token') as string

  const grantType =
    (formData.get('grant_type') as GrantType.AuthorizationCode) ||
    GrantType.RefreshToken

  console.log({
    refreshToken,
    grantType,
  })

  const accessClient = createAccessClient(context.env.Access)
  const tokens = refreshToken
    ? await accessClient.exchangeToken.mutate({
        token: refreshToken,
        grantType: GrantType.RefreshToken,
      })
    : await accessClient.exchangeToken.mutate({
        clientId,
        clientSecret,
        code,
        grantType: GrantType.AuthorizationCode,
      })
  const result = {
    token_type: 'Bearer',
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
  }

  if (tokens.idToken) Object.assign(result, { id_token: tokens.idToken })

  return json(result)
}
