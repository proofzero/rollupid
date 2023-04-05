import { json } from '@remix-run/cloudflare'
import { action as otpAction } from '~/routes/connect/email/otp'
import { EmailOTPValidator } from '@proofzero/design-system/src/molecules/email-otp-validator'
import {
  useActionData,
  useFetcher,
  useLoaderData,
  useLocation,
  useNavigate,
  useSubmit,
  useTransition,
} from '@remix-run/react'
import {
  getConsoleParams,
  getJWTConditionallyFromSession,
} from '~/session.server'
import { getAddressClient } from '~/platform.server'
import { authenticateAddress } from '~/utils/authenticate.server'
import { Loader } from '@proofzero/design-system/src/molecules/loader/Loader'
import { useEffect } from 'react'

import type { ActionFunction, LoaderFunction } from '@remix-run/cloudflare'
import { ERROR_CODES } from '@proofzero/errors'
import { Text } from '@proofzero/design-system'

export const loader: LoaderFunction = async ({ request, context, params }) => {
  const qp = new URL(request.url).searchParams

  const address = qp.get('address')
  if (!address) throw new Error('No address included in request')

  return json({
    address,
    clientId: params.clientId,
  })
}

export const action: ActionFunction = async ({ request, context, params }) => {
  const actionRes = await otpAction({ request, context, params })
  const { addressURN, successfulVerification } = await actionRes.json()

  if (successfulVerification) {
    const appData = await getConsoleParams(request, context.env)
    const addressClient = getAddressClient(
      addressURN,
      context.env,
      context.traceSpan
    )

    const { accountURN, existing } = await addressClient.resolveAccount.query({
      jwt: await getJWTConditionallyFromSession(
        request,
        context.env,
        appData?.clientId
      ),
      force: !appData || appData.prompt !== 'login',
    })

    return authenticateAddress(
      request,
      addressURN,
      accountURN,
      appData,
      context.env,
      context.traceSpan,
      existing
    )
  }

  return json({ error: true })
}

export default () => {
  const { address, clientId } = useLoaderData()
  const ad = useActionData()
  const submit = useSubmit()
  const navigate = useNavigate()
  const transition = useTransition()
  const location = useLocation()
  const fetcher = useFetcher()

  useEffect(() => {
    if (fetcher.state === 'idle' && !fetcher.data) {
      fetcher.load(`/connect/email/otp${location.search}`)
    }
  }, [fetcher, location])

  let message = 'Something went terribly wrong!'
  if (fetcher.data?.error?.data?.code === ERROR_CODES.BAD_REQUEST) {
    message = fetcher.data?.error?.shape?.message
  }

  return (
    <div
      className={
        'flex shrink flex-col items-center justify-center gap-4 mx-auto\
      bg-white p-6 h-[100dvh] lg:h-[675px] lg:max-h-[100dvh] w-full\
       lg:w-[418px] lg:border-rounded-lg'
      }
      style={{
        border: '1px solid #D1D5DB',
        boxSizing: 'border-box',
      }}
    >
      {transition.state !== 'idle' && <Loader />}

      <EmailOTPValidator
        loading={transition.state !== 'idle' || fetcher.state !== 'idle'}
        email={address}
        state={fetcher.data?.state}
        invalid={ad?.error}
        requestRegeneration={async () => {
          fetcher.load(`/connect/email/otp${location.search}`)
        }}
        requestVerification={async (email, code, state) => {
          submit(
            {
              address: email,
              code,
              state,
            },
            {
              method: 'post',
            }
          )
        }}
        goBack={() => history.back()}
        onCancel={() => navigate(`/authenticate/${clientId}`)}
      >
        {transition.state === 'idle' &&
        fetcher.state === 'idle' &&
        fetcher.data?.error ? (
          <Text
            size="sm"
            weight="medium"
            className="text-red-500 mt-4 mb-2 text-center"
          >
            {message}
          </Text>
        ) : undefined}
      </EmailOTPValidator>
    </div>
  )
}
