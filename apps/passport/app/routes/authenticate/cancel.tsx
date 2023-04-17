import { LoaderFunction, redirect } from '@remix-run/cloudflare'
import { destroyConsoleParamsSession, getConsoleParams } from '~/session.server'

export const loader: LoaderFunction = async ({ request, context }) => {
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

  const qp = new URLSearchParams()
  qp.append('state', cp.state)
  qp.append('client_id', cp.clientId)
  qp.append('redirect_uri', cp.redirectUri)
  qp.append('scope', cp.scope.join(' '))
  qp.append('connect_result', 'CANCEL')

  return redirect(`/authorize?${qp.toString()}`, { headers })
}
