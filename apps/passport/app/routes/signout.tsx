import type { LoaderFunction } from '@remix-run/cloudflare'
import { getConsoleParamsSession, logout } from '~/session.server'

export const loader: LoaderFunction = async ({ request, context }) => {
  const appData = await getConsoleParamsSession(request, context.env)
    .then((session) => JSON.parse(session.get('params')))
    .catch((err) => {
      console.log('No console params session found')
      return null
    })

  const url = new URL(request.url)
  const params = new URLSearchParams(url.search)
  const redirectTo = params.get('redirect_uri') || '/'
  return logout(request, redirectTo, context.env, appData?.clientId)
}
