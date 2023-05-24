import { useState } from 'react'

import { useSubmit } from '@remix-run/react'
import { redirect } from '@remix-run/cloudflare'
import { getAccountClient, getAddressClient } from '~/platform.server'
import {
  getAuthzCookieParams,
  getValidatedSessionContext,
} from '~/session.server'

import { SmartContractWalletCreationSummary } from '@proofzero/design-system/src/molecules/smart-contract-wallet-connection/SmartContractWalletConnection'
import { Text } from '@proofzero/design-system'
import { TosAndPPol } from "@proofzero/design-system/src/atoms/info/TosAndPPol"

import sideGraphics from '~/assets/auth-side-graphics.svg'
import subtractLogo from '../../assets/subtract-logo.svg'

import type { ActionFunction } from '@remix-run/cloudflare'

export const action: ActionFunction = async ({ request, context, params }) => {
  const authzCookieParams = await getAuthzCookieParams(request, context.env)
  const { jwt, accountUrn } = await getValidatedSessionContext(
    request,
    authzCookieParams,
    context.env,
    context.traceSpan
  )
  const accountClient = getAccountClient(jwt, context.env, context.traceSpan)
  const profile = await accountClient.getProfile.query({ account: accountUrn })

  const addressClient = getAddressClient(
    profile?.primaryAddressURN!,
    context.env,
    context.traceSpan
  )

  const formData = await request.formData()
  const nickname = formData.get('nickname') as string

  await addressClient.initSmartContractWallet.query({
    nickname,
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

export default () => {
  const submit = useSubmit()
  const [nickname, setNickname] = useState('')
  const [disabled, setDisabled] = useState(false)

  const formData = new FormData()

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
        <div
          className={
            'flex shrink flex-col items-center\
         justify-center gap-4 mx-auto bg-white p-6 h-[100dvh]\
          lg:h-[580px] lg:max-h-[100dvh] w-full lg:w-[418px]\
          lg:rounded-lg'
          }
          style={{
            border: '1px solid #D1D5DB',
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
  )
}
