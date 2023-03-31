import { Outlet, useLoaderData, useOutletContext } from '@remix-run/react'
import type { LoaderFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'
import { getUserSession, parseJwt } from '~/session.server'
import type { AccountURN } from '@proofzero/urns/account'
import { getAccountClient, getStarbaseClient } from '~/platform.server'

export const loader: LoaderFunction = async ({ request, context, params }) => {
  let appProps
  if (params.clientId !== 'console' && params.clientId !== 'passport') {
    const sbClient = getStarbaseClient('', context.env, context.traceSpan)
    appProps = await sbClient.getAppPublicProps.query({
      clientId: params.clientId as string,
    })
  }

  const session = await getUserSession(request, context.env, params.clientId)

  let profile
  const jwt = session.get('jwt')
  if (jwt) {
    const account = parseJwt(jwt).sub as AccountURN
    const accountClient = getAccountClient(jwt, context.env, context.traceSpan)
    profile = await accountClient.getProfile.query({ account })
  }

  return json({
    appProps,
    profile,
  })
}

export default () => {
  const context = useOutletContext<{
    prompt?: string
  }>()
  const { appProps, profile } = useLoaderData()

  return <Outlet context={{ ...context, appProps, profile }} />
}
