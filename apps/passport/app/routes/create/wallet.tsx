import { Outlet, useLoaderData } from '@remix-run/react'
import { LoaderFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'
import {
  getAccountClient,
  getAddressClient,
  getStarbaseClient,
} from '~/platform.server'
import {
  getConsoleParams,
  getJWTConditionallyFromSession,
  getValidatedSessionContext,
  parseJwt,
} from '~/session.server'

import { SmartContractWalletCreationSummary } from '@proofzero/design-system/src/molecules/smart-contract-wallet-connection/SmartContractWalletConnection'

import sideGraphics from '~/assets/auth-side-graphics.svg'
import type { AccountURN } from '@proofzero/urns/account'
import { UnauthorizedError } from '@proofzero/errors'

export const loader: LoaderFunction = async ({ request, context, params }) => {
  const jwt = await getJWTConditionallyFromSession(request, context.env)

  if (!jwt) {
    throw new UnauthorizedError({
      message: 'You need to be logged in to create a wallet',
    })
  }

  const account = parseJwt(jwt).sub as AccountURN
  const accountClient = getAccountClient(jwt, context.env, context.traceSpan)
  const profile = await accountClient.getProfile.query({ account })

  const addressClient = getAddressClient(
    profile?.primaryAddressURN!,
    context.env,
    context.traceSpan
  )

  const SCwallet = await addressClient.initSmartContractWallet.query()
  return json({
    wallet: SCwallet.walletAddress,
  })
}

export default () => {
  const { wallet } = useLoaderData()

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
          lg:h-[675px] lg:max-h-[100dvh] w-full lg:w-[418px]\
          lg:rounded-lg'
          }
          style={{
            border: '1px solid #D1D5DB',
            boxSizing: 'border-box',
          }}
        >
          <SmartContractWalletCreationSummary
            placeholder={wallet}
            completeCallback={() => {}}
          />
        </div>
      </div>
    </div>
  )
}
