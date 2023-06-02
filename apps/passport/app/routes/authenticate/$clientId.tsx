import { Outlet, useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/cloudflare'
import { getStarbaseClient } from '~/platform.server'
import { getAuthzCookieParams } from '~/session.server'

import sideGraphics from '~/assets/auth-side-graphics.svg'
import LogoIndigo from '~/assets/PassportLogoIndigo.svg'

import type { LoaderFunction } from '@remix-run/cloudflare'
import { GetAppPublicPropsResult } from '@proofzero/platform/starbase/src/jsonrpc/methods/getAppPublicProps'
import { Helmet } from 'react-helmet'
import { getRGBColor } from '@proofzero/design-system/src/helpers'
import { useEffect, useState } from 'react'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { AuthenticationScreenDefaults } from '@proofzero/design-system/src/templates/authentication/Authentication'

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context, params }) => {
    let appProps: GetAppPublicPropsResult
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
)

export default () => {
  const { clientId, appProps, rollup_action } = useLoaderData<{
    clientId: string
    appProps: GetAppPublicPropsResult
    rollup_action?: string
  }>()

  const [dark, setDark] = useState<boolean>(false)
  useEffect(() => {
    const darkMode = window.matchMedia('(prefers-color-scheme: dark)')
    setDark(darkMode.matches)
  }, [])

  return (
    <>
      <Helmet>
        <style type="text/css">{`
            :root {
                ${getRGBColor(
                  dark
                    ? appProps?.appTheme?.color?.dark ??
                        AuthenticationScreenDefaults.color.dark
                    : appProps?.appTheme?.color?.light ??
                        AuthenticationScreenDefaults.color.light,
                  'primary'
                )}   
             {
         `}</style>
      </Helmet>

      <div className={'flex flex-row h-[100dvh] justify-center items-center'}>
        <div
          className={
            'basis-2/5 h-[100dvh] w-full hidden lg:flex justify-center items-center bg-indigo-50 overflow-hidden'
          }
          style={{
            background: `url(${
              appProps?.appTheme?.graphicURL ?? sideGraphics
            })`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        ></div>
        <div
          className={
            'basis-full basis-full lg:basis-3/5 bg-[#F9FAFB] dark:bg-gray-900'
          }
        >
          <Outlet context={{ clientId, appProps, rollup_action, dark }} />
        </div>
      </div>
    </>
  )
}
