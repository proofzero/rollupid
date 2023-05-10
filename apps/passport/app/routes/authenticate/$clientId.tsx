import { Outlet, useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/cloudflare'
import { getStarbaseClient } from '~/platform.server'
import { getAuthzCookieParams } from '~/session.server'

import sideGraphics from '~/assets/auth-side-graphics.svg'
import LogoIndigo from '~/assets/PassportLogoIndigo.svg'

import type { LoaderFunction, MetaFunction } from '@remix-run/cloudflare'

import social from '~/assets/passport-social.png'

export const loader: LoaderFunction = async ({ request, context, params }) => {
  let appProps
  if (params.clientId !== 'console' && params.clientId !== 'passport') {
    const sbClient = getStarbaseClient('', context.env, context.traceSpan)
    appProps = await sbClient.getAppPublicProps.query({
      clientId: params.clientId as string,
    })
  } else {
    appProps = {
      name: `Rollup - ${
        params.clientId.charAt(0).toUpperCase() + params.clientId.slice(1)
      }`,
      iconURL: LogoIndigo,
      termsURL: 'https://rollup.id/tos',
      privacyURL: 'https://rollup.id/privacy-policy',
      redirectURI: `https://${params.clientId}.rollup.id`,
      websiteURL: 'https://rollup.id',
    }
  }

  const cp = await getAuthzCookieParams(request, context.env)

  let rollup_action
  if (
    cp &&
    cp.rollup_action &&
    ['connect', 'reconnect'].includes(cp?.rollup_action)
  ) {
    rollup_action = cp?.rollup_action
  }

  return json({
    clientId: params.clientId,
    appProps,
    rollup_action,
  })
}

// TODO: update with white label settings
export const meta: MetaFunction = ({
  data,
}: {
  data: ReturnType<typeof loader>
}) => ({
  charset: 'utf-8',
  title: data?.appProps.name,
  viewport: 'width=device-width,initial-scale=1',
  'og:url': data?.appProps.redirectURI,
  'og:description': 'Identity management for the private web.',
  'og:image': social,
  'twitter:card': 'summary_large_image',
  'twitter:site': '@rollupid_xyz',
  'twitter:creator': '@rollupid_xyz',
})

export default () => {
  const { clientId, appProps, rollup_action } = useLoaderData()

  return (
    <div className={'flex flex-row h-[100dvh] justify-center items-center'}>
      <div
        className={
          'basis-2/5 h-[100dvh] w-full hidden lg:flex justify-center items-center bg-indigo-50 overflow-hidden'
        }
      >
        <img src={sideGraphics} alt="Background graphics" />
      </div>
      <div className={'basis-full basis-full lg:basis-3/5'}>
        <Outlet context={{ clientId, appProps, rollup_action }} />
      </div>
    </div>
  )
}
