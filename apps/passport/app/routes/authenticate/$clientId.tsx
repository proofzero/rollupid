import { Outlet, useLoaderData } from '@remix-run/react'
import { LoaderFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'
import { getStarbaseClient } from '~/platform.server'

export const loader: LoaderFunction = async ({ context, params }) => {
  let appProps
  if (params.clientId !== 'console' && params.clientId !== 'passport') {
    const sbClient = getStarbaseClient('', context.env, context.traceSpan)
    appProps = await sbClient.getAppPublicProps.query({
      clientId: params.clientId as string,
    })
  }

  return json({
    clientId: params.clientId,
    appProps,
  })
}

export default () => {
  const { clientId, appProps } = useLoaderData()

  return <Outlet context={{ clientId, appProps }} />
}
