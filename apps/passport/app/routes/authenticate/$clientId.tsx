import { Outlet, useLoaderData } from '@remix-run/react'
import { LoaderFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'
import { getStarbaseClient } from '~/platform.server'
import { getConsoleParams } from '~/session.server'

import sideGraphics from '~/assets/auth-side-graphics.svg'
import LogoIndigo from '~/assets/PassportLogoIndigo.svg'

export const loader: LoaderFunction = async ({ request, context, params }) => {
  let appProps
  if (params.clientId !== 'console' && params.clientId !== 'passport') {
    const sbClient = getStarbaseClient('', context.env, context.traceSpan)
    appProps = await sbClient.getAppPublicProps.query({
      clientId: params.clientId as string,
    })
  } else {
    appProps = {
      name: 'Rollup ID',
      iconURL: LogoIndigo,
      termsURL: 'https://rollup.id/tos',
      privacyURL: 'https://rollup.id/privacy-policy',
    }
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

  return (
    <div className={'flex flex-row h-screen justify-center items-center'}>
      <div
        className={
          'basis-2/5 h-screen w-full hidden lg:flex justify-center items-center bg-indigo-50 overflow-hidden'
        }
      >
        <img src={sideGraphics} alt="Background graphics" />
      </div>
      <div className={'basis-full basis-full lg:basis-3/5'}>
        <Outlet context={{ clientId, appProps, connectFlow }} />
      </div>
    </div>
  )
}
