import { Outlet, useLoaderData, useOutletContext } from '@remix-run/react'
import type { LoaderFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'
import {
  destroyConsoleParamsSession,
  getConsoleParamsSession,
  getUserSession,
  parseJwt,
  setConsoleParamsSession,
} from '~/session.server'
import type { AccountURN } from '@proofzero/urns/account'
import { getAccountClient, getStarbaseClient } from '~/platform.server'

export const loader: LoaderFunction = async ({ request, context, params }) => {
  let clientId
  const headers = new Headers()

  if (params.clientId !== 'console' && params.clientId !== 'passport') {
    const consoleParmamsSessionFromCookie = await getConsoleParamsSession(
      request,
      context.env,
      params.clientId!
    )
    const consoleParamsSession = consoleParmamsSessionFromCookie.get('params')
    const parsedParams = consoleParamsSession
      ? await JSON.parse(consoleParamsSession)
      : context.consoleParams
    clientId = parsedParams?.clientId || undefined

    if (!clientId && !context.consoleParams.clientId) {
      throw json(
        {
          message: 'App not found',
        },
        {
          status: 404,
        }
      )
    }

    headers.append(
      'Set-Cookie',
      await setConsoleParamsSession(parsedParams, context.env, 'last')
    )
  } else {
    headers.append(
      'Set-Cookie',
      await destroyConsoleParamsSession(request, context.env, 'last')
    )
  }
  let appProps
  if (clientId && clientId !== 'console' && clientId !== 'passport') {
    const sbClient = getStarbaseClient('', context.env, context.traceSpan)
    appProps = await sbClient.getAppPublicProps.query({ clientId })
  }

  const session = await getUserSession(request, context.env, clientId)

  let profile
  const jwt = session.get('jwt')
  if (jwt) {
    const account = parseJwt(jwt).sub as AccountURN
    const accountClient = getAccountClient(jwt, context.env, context.traceSpan)
    profile = await accountClient.getProfile.query({ account })
  }

  return json(
    {
      appProps,
      profile,
    },
    {
      headers,
    }
  )
}

export default () => {
  const context = useOutletContext<{
    prompt?: string
  }>()
  const { appProps, profile } = useLoaderData()

  return <Outlet context={{ ...context, appProps, profile }} />
}
