import { ActionFunction, json } from '@remix-run/cloudflare'
import createAccessClient from '@kubelt/platform-clients/access'
import { GrantType } from '@kubelt/platform.access/src/types'

export const action: ActionFunction = async ({ request, context }) => {
  const formData = await request.formData()
  const clientId = formData.get('client_id') as string
  const clientSecret = formData.get('client_secret') as string
  const code = formData.get('code') as string
  const grantType =
    (formData.get('grant_type') as GrantType.AuthorizationCode) ||
    GrantType.RefreshToken

  console.log({ clientId, clientSecret, code, grantType })

  const accessClient = createAccessClient(context.env.Access)
  const tokens = await accessClient.exchangeToken.mutate({
    clientId,
    clientSecret,
    code,
    grantType,
  })

  return json({
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
  })
}
