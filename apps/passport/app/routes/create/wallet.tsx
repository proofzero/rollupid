import { useContext, useState } from 'react'

import { useLoaderData, useSubmit } from '@remix-run/react'
import { redirect } from '@remix-run/cloudflare'
import { getCoreClient } from '~/platform.server'
import {
  getAuthzCookieParams,
  getValidatedSessionContext,
} from '~/session.server'

import { SmartContractWalletCreationSummary } from '@proofzero/design-system/src/molecules/smart-contract-wallet-connection/SmartContractWalletConnection'
import { Text } from '@proofzero/design-system'
import { TosAndPPol } from '@proofzero/design-system/src/atoms/info/TosAndPPol'

import sideGraphics from '~/assets/auth-side-graphics.svg'
import subtractLogo from '../../assets/subtract-logo.svg'

import type { ActionFunction, LoaderFunction } from '@remix-run/cloudflare'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { ThemeContext } from '@proofzero/design-system/src/contexts/theme'
import { Helmet } from 'react-helmet'
import type { GetAppPublicPropsResult } from '@proofzero/platform/starbase/src/jsonrpc/methods/getAppPublicProps'
import { getRGBColor, getTextColor } from '@proofzero/design-system/src/helpers'
import { AuthenticationScreenDefaults } from '@proofzero/design-system/src/templates/authentication/Authentication'
import { createNewSCWallet } from '~/utils/authorize.server'

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context, params }) => {
    const authzCookieParams = await getAuthzCookieParams(request, context.env)
    const { jwt, identityURN } = await getValidatedSessionContext(
      request,
      authzCookieParams,
      context.env,
      context.traceSpan
    )
    const coreClient = getCoreClient({ context, jwt })
    const profile = await coreClient.identity.getProfile.query({
      identity: identityURN,
    })

    const formData = await request.formData()
    const nickname = formData.get('nickname') as string

    await createNewSCWallet({
      nickname,
      primaryAccountURN: profile?.primaryAccountURN!,
      env: context.env,
      traceSpan: context.traceSpan,
    })

    const { redirectUri, state, scope, clientId, prompt, login_hint } =
      authzCookieParams

    const qp = new URLSearchParams()
    qp.append('client_id', clientId)
    qp.append('redirect_uri', redirectUri)
    qp.append('state', state)
    qp.append('scope', scope.join(' '))
    if (prompt) qp.append('prompt', prompt)
    if (login_hint) qp.append('login_hint', login_hint)

    return redirect(`/authorize?${qp.toString()}`)
  }
)

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const authzCookieParams = await getAuthzCookieParams(request, context.env)
    await getValidatedSessionContext(
      request,
      authzCookieParams,
      context.env,
      context.traceSpan
    )

    const { clientId } = authzCookieParams

    let appProps: GetAppPublicPropsResult | undefined
    if (clientId !== 'console' && clientId !== 'passport') {
      const coreClient = getCoreClient({ context })
      appProps = await coreClient.starbase.getAppPublicProps.query({
        clientId: clientId as string,
      })
    }

    return {
      appProps,
    }
  }
)

export default () => {
  const submit = useSubmit()
  const [nickname, setNickname] = useState('')
  const [disabled, setDisabled] = useState(false)

  const formData = new FormData()

  const { appProps } = useLoaderData<{
    appProps: GetAppPublicPropsResult | undefined
  }>()

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
          className={`flex flex-row h-screen justify-center items-center bg-[#F9FAFB] dark:bg-gray-900`}
        >
          <div
            className={
              'basis-2/5 h-[100dvh] w-full hidden lg:flex justify-center items-center bg-indigo-50 dark:bg-[#1F2937] overflow-hidden'
            }
            style={{
              backgroundImage: `url(${
                appProps?.appTheme?.graphicURL ?? sideGraphics
              })`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          ></div>
          <div className={'basis-full basis-full lg:basis-3/5'}>
            <div
              className={
                'flex shrink flex-col items-center\
         justify-center gap-4 mx-auto bg-white p-6 h-[100dvh]\
          lg:h-[580px] lg:max-h-[100dvh] w-full lg:w-[418px]\
          lg:rounded-lg border dark:bg-gray-800 dark:border-gray-600'
              }
              style={{
                boxSizing: 'border-box',
              }}
            >
              <SmartContractWalletCreationSummary
                onChange={(value) => {
                  setNickname(value)
                }}
                onSubmit={() => {
                  formData.set('nickname', nickname)
                  submit(formData, { method: 'post' })
                  setDisabled(true)
                }}
                disabled={!nickname || nickname.length < 4 || disabled}
              />
              <div className="mt-2 flex justify-center items-center space-x-2">
                <img src={subtractLogo} alt="powered by rollup.id" />
                <Text size="xs" weight="normal" className="text-gray-400">
                  Powered by{' '}
                  <a href="https://rollup.id" className="hover:underline">
                    rollup.id
                  </a>
                </Text>
                <TosAndPPol />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
