import { Outlet, useLoaderData } from '@remix-run/react'
import { LoaderFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'
import { getStarbaseClient } from '~/platform.server'

import sideGraphics from '~/assets/auth-side-graphics.svg'

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
        <Outlet context={{ clientId, appProps }} />
      </div>
    </div>
  )
}
