import { LoaderArgs, LoaderFunction, redirect } from '@remix-run/cloudflare'
import { getConsoleParamsSession } from '~/session.server'

export const loader: LoaderFunction = async ({
  request,
  context,
}: LoaderArgs) => {
  const appData = await getConsoleParamsSession(request, context.env)
    .then((session) => JSON.parse(session.get('params')))
    .catch((err) => {
      console.log('No console params session found')
      return null
    })

  if (appData?.prompt === 'login') return redirect(appData.redirectUri)

  return null
}
