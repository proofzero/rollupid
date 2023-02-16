import { json, LoaderFunction } from '@remix-run/cloudflare'
import { redirect } from '@remix-run/cloudflare'
import { Suspense } from 'react'

import { getUserSession, setConsoleParamsSession } from '~/session.server'

import React from 'react'
import type { CatchBoundaryComponent } from '@remix-run/react/dist/routeModules'
import { useCatch } from '@remix-run/react'
import { ErrorPage } from '@kubelt/design-system/src/pages/error/ErrorPage'

// TODO: loader function check if we have a session already
// redirect if logged in
export const loader: LoaderFunction = async ({ request, context }) => {
  const session = await getUserSession(request, context.env)
  const searchParams = new URL(request.url).searchParams

  if (session.get('jwt') && searchParams.get('client_id')) {
    if (searchParams.get('prompt') === 'login') {
      return json(
        {},
        {
          headers: {
            'Set-Cookie': await setConsoleParamsSession(
              context.consoleParams,
              context.env
            ),
          },
        }
      )
    } else {
      const searchParams = new URL(request.url).searchParams
      return redirect(`/authorize?${searchParams}`)
    }
  }
  if (session.get('jwt')) {
    return redirect(context.env.CONSOLE_APP_URL)
  }
  return null
}

const LazyAuth = React.lazy(() =>
  import('~/web3/lazyAuth').then((module) => ({ default: module.LazyAuth }))
)

export default function Index() {
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
        <Suspense fallback={/*Show some spinner*/ ''}>
          <LazyAuth />
        </Suspense>
      </div>
    </div>
  )
}

export const CatchBoundary: CatchBoundaryComponent = () => {
  const caught = useCatch()

  return (
    <div className="min-h-[100dvh] flex flex-col justify-center">
      <ErrorPage
        code={'' + caught.status}
        message={caught.data.message}
        pepe={false}
      />
    </div>
  )
}
