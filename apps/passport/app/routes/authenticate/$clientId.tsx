import { Outlet, useLoaderData } from '@remix-run/react'
import { LoaderFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'
import { getStarbaseClient } from '~/platform.server'
import { getConsoleParams } from '~/session.server'

export const loader: LoaderFunction = async ({ request, context, params }) => {
  let appProps
  if (params.clientId !== 'console' && params.clientId !== 'passport') {
    const sbClient = getStarbaseClient('', context.env, context.traceSpan)
    appProps = await sbClient.getAppPublicProps.query({
      clientId: params.clientId as string,
    })
  }

  const cp = await getConsoleParams(request, context.env)

  return json({
    clientId: params.clientId,
    appProps,
    connectFlow: cp?.prompt === 'connect',
  })
}

export default () => {
  const { clientId, appProps, connectFlow } = useLoaderData()

  return <Outlet context={{ clientId, appProps, connectFlow }} />
}
