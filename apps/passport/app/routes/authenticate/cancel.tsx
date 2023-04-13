import { LoaderFunction, redirect } from '@remix-run/cloudflare'
import { destroyConsoleParamsSession, getConsoleParams } from '~/session.server'

export const loader: LoaderFunction = async ({ request, context }) => {
  const url = new URL(request.url)
  const proxyURL = url.searchParams.get('proxy_url')

  const cp = await getConsoleParams(request, context.env)
  if (!cp) {
    throw new Error('No console params')
  }

  if (cp.prompt !== 'connect') {
    throw new Error('Not a connect flow')
  }

  const headers = new Headers()
  headers.append(
    'Set-Cookie',
    await destroyConsoleParamsSession(request, context.env, cp.clientId)
  )

  headers.append(
    'Set-Cookie',
    await destroyConsoleParamsSession(request, context.env)
  )

  let redirectURL = new URL(cp.redirectUri)
  if (proxyURL) {
    redirectURL = new URL(proxyURL)
  }

  redirectURL.searchParams.append('error', 'access_denied')
  redirectURL.searchParams.append(
    'error_description',
    'The user denied the request'
  )

  if (cp.clientId !== 'passport' && cp.clientId !== 'console') {
    redirectURL.searchParams.append('state', cp.state)
    redirectURL.searchParams.append('client_id', cp.clientId)
    redirectURL.searchParams.append('redirect_uri', cp.redirectUri)
    redirectURL.searchParams.append('scope', cp.scope)

    return redirect(redirectURL.toString())
  }

  return redirect(redirectURL.toString(), { headers })
}
