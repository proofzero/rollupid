import type { LoaderFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'
import { redirect } from '@remix-run/cloudflare'
import { Suspense } from 'react'

import { getConsoleParamsSession, getUserSession } from '~/session.server'

import type { CatchBoundaryComponent } from '@remix-run/react/dist/routeModules'
import { useCatch, useLoaderData, useOutletContext } from '@remix-run/react'
import { ErrorPage } from '@proofzero/design-system/src/pages/error/ErrorPage'
import { LazyAuth } from '~/web3/lazyAuth'
import sideGraphics from '~/assets/auth-side-graphics.svg'

// TODO: loader function check if we have a session already
// redirect if logged in
export const loader: LoaderFunction = async ({ request, context, params }) => {
  const searchParams = new URL(request.url).searchParams
  const prompt = searchParams.get('prompt')

  const session = await getUserSession(request, context.env, params.clientId)
  const jwt = session.get('jwt')

  if (jwt) {
    if (prompt === 'none') {
      return redirect(`/authorize?${searchParams}`)
    }
  }

  if (!params.clientId) {
    return redirect(`/authenticate/console`)
  }

  return json({
    prompt,
  })
}

export default function Index() {
  const context = useOutletContext() || {}
  const data = useLoaderData()

  return (
    <div className={'flex flex-row h-screen justify-center items-center'}>
      <div
        className={
          'basis-2/5 h-screen w-full hidden lg:flex justify-center items-center bg-indigo-50 overflow-hidden'
        }
      >
        <img src={sideGraphics} />
      </div>
      <div className={'basis-full basis-full lg:basis-3/5'}>
        <Suspense fallback={''}>
          <LazyAuth context={{ ...context, ...data }} autoConnect={true} />
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
        backBtn={false}
      />
    </div>
  )
}
