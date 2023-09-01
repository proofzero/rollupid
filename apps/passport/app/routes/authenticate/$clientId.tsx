import { Outlet, useLoaderData, useOutletContext } from '@remix-run/react'
import { json } from '@remix-run/cloudflare'
import { getAuthzCookieParams, isSupportedRollupAction } from '~/session.server'

import sideGraphics from '~/assets/auth-side-graphics.svg'

import type { LoaderFunction } from '@remix-run/cloudflare'
import type { GetAppPublicPropsResult } from '@proofzero/platform/starbase/src/jsonrpc/methods/getAppPublicProps'
import { Helmet } from 'react-helmet'
import { getRGBColor, getTextColor } from '@proofzero/design-system/src/helpers'
import { useContext } from 'react'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { AuthenticationScreenDefaults } from '@proofzero/design-system/src/templates/authentication/Authentication'
import { ThemeContext } from '@proofzero/design-system/src/contexts/theme'

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context, params }) => {
    if (
      request.cf &&
      request.cf.botManagement.score <= 30 &&
      !['localhost', '127.0.0.1'].includes(new URL(request.url).hostname)
    ) {
      return null
    }

    const cp = await getAuthzCookieParams(request, context.env)

    let rollup_action
    if (cp && cp.rollup_action && isSupportedRollupAction(cp.rollup_action)) {
      rollup_action = cp.rollup_action
    }

    return json({
      clientId: params.clientId,
      rollup_action,
    })
  }
)

export default () => {
  const { clientId, rollup_action } =
    useLoaderData<{
      clientId: string
      rollup_action?: string
    }>() ?? {}

  const { appProps } = useOutletContext<{ appProps: GetAppPublicPropsResult }>()

  const { dark } = useContext(ThemeContext)

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
                ${getRGBColor(
          getTextColor(
            dark
              ? appProps?.appTheme?.color?.dark ??
              AuthenticationScreenDefaults.color.dark
              : appProps?.appTheme?.color?.light ??
              AuthenticationScreenDefaults.color.light
          ),
          'primary-contrast-text'
        )}
             {
         `}</style>
      </Helmet>

      <div className={`${dark ? 'dark' : ''}`}>
        <div
          className={`flex flex-row h-[100dvh] justify-center items-center bg-[#F9FAFB] dark:bg-gray-900`}
        >
          <div
            className={
              'basis-2/5 h-[100dvh] w-full hidden lg:flex justify-center items-center bg-indigo-50 dark:bg-[#1F2937] overflow-hidden'
            }
            style={{
              backgroundImage: `url(${appProps?.appTheme?.graphicURL ?? sideGraphics
                })`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          ></div>
          <div className={'basis-full basis-full lg:basis-3/5'}>
            <Outlet context={{ clientId, appProps, rollup_action, dark }} />
          </div>
        </div>
      </div>
    </>
  )
}
