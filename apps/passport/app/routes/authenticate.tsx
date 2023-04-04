import type { LoaderFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'
import { redirect } from '@remix-run/cloudflare'
import { Suspense } from 'react'

import { getConsoleParams, getUserSession } from '~/session.server'

import type { CatchBoundaryComponent } from '@remix-run/react/dist/routeModules'
import { useCatch } from '@remix-run/react'
import { ErrorPage } from '@proofzero/design-system/src/pages/error/ErrorPage'
import { LazyAuth } from '~/web3/lazyAuth'
import sideGraphics from '~/assets/auth-side-graphics.svg'

import { loader as indexLoader } from '~/routes/index'

export const loader: LoaderFunction = async ({ request, context, params }) => {
  const consoleParams = await getConsoleParams(
    request,
    context.env,
    params.clientId
  )

  if (!consoleParams) {
    return indexLoader({ request, context, params })
  }

  return null
}

export default function Index() {
  return (
    <div className={'flex flex-row h-screen justify-center items-center'}>
      <div
        className={
          'basis-2/5 h-screen w-full hidden lg:flex justify-center items-center bg-indigo-50 overflow-hidden'
        }
      >
        <img src={sideGraphics} alt="Not Found" />
      </div>
      <div className={'basis-full basis-full lg:basis-3/5'}>
        <Suspense fallback={''}>
          <LazyAuth autoConnect={true} />
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
