import { json } from '@remix-run/cloudflare'
import type { LoaderFunction } from '@remix-run/cloudflare'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  ({ request }) => {
    const { origin } = new URL(request.url)
    return json({
      issuer: `${origin}`,
      authorization_endpoint: `${origin}/authorize`,
      token_endpoint: `${origin}/token`,
      token_endpoint_auth_methods_supported: ['client_secret_post'],
      token_endpoint_auth_signing_alg_values_supported: ['ES256'],
      userinfo_endpoint: `${origin}/userinfo`,
      jwks_uri: `${origin}/.well-known/jwks.json`,
      scopes_supported: ['openid', 'profile', 'email'],
      response_types_supported: ['code'],
      subject_types_supported: ['public', 'pairwise'],
      userinfo_signing_alg_values_supported: ['ES256'],
      id_token_signing_alg_values_supported: ['ES256'],
      request_object_signing_alg_values_supported: ['ES256'],
      claims_supported: ['sub', 'iss'],
      service_documentation: 'https://docs.rollup.id/',
    })
  }
)
