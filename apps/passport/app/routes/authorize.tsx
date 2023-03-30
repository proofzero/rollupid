import type { LoaderFunction } from '@remix-run/cloudflare'
import { redirect } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'
import { Outlet, useLoaderData } from '@remix-run/react'
import { getAccountClient } from '~/platform.server'
import {
  createConsoleParamsSession,
  destroyConsoleParamsSession,
  getConsoleParamsSession,
  getValidatedSessionContext,
} from '~/session.server'

// TODO: loader function check if we have a session already
// redirect if logged in
export const loader: LoaderFunction = async ({ request, context }) => {
  const params = new URL(request.url).searchParams
  const prompt = params.get('prompt')

  const consoleParmamsSessionFromCookie = await getConsoleParamsSession(
    request,
    context.env,
    'last'
  )
  const consoleParamsSession = consoleParmamsSessionFromCookie.get('params')
  const parsedParams = consoleParamsSession
    ? await JSON.parse(consoleParamsSession)
    : context.consoleParams

  const headers = new Headers()

  const clientId = parsedParams?.clientId || undefined

  console.log('FRESH', {
    cp: context.consoleParams,
  })

  if (clientId) {
    headers.append(
      'Set-Cookie',
      await destroyConsoleParamsSession(request, context.env, 'last')
    )

    headers.append(
      'Set-Cookie',
      await destroyConsoleParamsSession(request, context.env, clientId)
    )

    // This is to facilitate returning back
    // to settings after the connected
    // account flow
    if (parsedParams.prompt === 'login') {
      return redirect('/settings', {
        headers,
      })
    }
  } else {
    if (prompt !== 'none') {
      console.log('authorize.tsx', {
        cId: context.consoleParams,
      })
      if (context.consoleParams.clientId)
        throw await createConsoleParamsSession(
          context.consoleParams,
          context.env
        )
    }
  }

  // this will redirect unauthenticated users to the auth page but maintain query params
  const { jwt, accountUrn } = await getValidatedSessionContext(
    request,
    context.consoleParams,
    context.env,
    context.traceSpan
  )

  const accountClient = getAccountClient(jwt, context.env, context.traceSpan)
  const profile = await accountClient.getProfile.query({ account: accountUrn })

  return json(
    { profile },
    {
      headers,
    }
  )
}

export default function Authorize() {
  const { profile } = useLoaderData()
  return (
    <div className={'flex flex-row h-screen justify-center items-center'}>
      <div
        style={{
          backgroundImage: `url(https://imagedelivery.net/VqQy1abBMHYDZwVsTbsSMw/918fa1e6-d9c2-40d3-15cf-63131a2d8400/public)`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }}
        className={'basis-2/5 h-screen w-full hidden lg:block'}
      ></div>
      <div className={'basis-full basis-full lg:basis-3/5'}>
        <Outlet context={{ profile }} />
      </div>
    </div>
  )
}
