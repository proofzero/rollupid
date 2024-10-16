import { ActionFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'

import { GrantType } from '@proofzero/types/authorization'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'

import { getCoreClient } from '../platform.server'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const formData = await request.formData()
    const clientId = formData.get('client_id') as string
    const clientSecret = formData.get('client_secret') as string
    const code = formData.get('code') as string
    const refreshToken = formData.get('refresh_token') as string
    const issuer = new URL(request.url).origin
    const grantType =
      (formData.get('grant_type') as GrantType.AuthorizationCode) ||
      GrantType.RefreshToken

    const coreClient = getCoreClient({ context })

    const tokens = refreshToken
      ? await coreClient.authorization.exchangeToken.mutate({
          grantType: GrantType.RefreshToken,
          refreshToken,
          clientId,
          clientSecret,
          issuer,
        })
      : await coreClient.authorization.exchangeToken.mutate({
          grantType: GrantType.AuthorizationCode,
          code,
          clientId,
          clientSecret,
          issuer,
        })

    const result = {
      token_type: 'Bearer',
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
    }

    if (tokens.idToken) Object.assign(result, { id_token: tokens.idToken })

    return json(result, {
      //spec adherence and general good practice
      headers: {
        'Cache-Control': 'no-store',
        Pragma: 'no-cache',
      },
    })
  }
)
