import { json } from '@remix-run/cloudflare'
import { action as otpAction } from '~/routes/connect/email/otp'
import { EmailOTPValidator } from '@proofzero/design-system/src/molecules/email-otp-validator'
import {
  useActionData,
  useFetcher,
  useLoaderData,
  useLocation,
  useNavigate,
  useOutletContext,
  useSubmit,
  useTransition,
} from '@remix-run/react'
import { getAuthzCookieParams, getUserSession } from '~/session.server'
import { getAddressClient } from '~/platform.server'
import { authenticateAddress } from '~/utils/authenticate.server'
import { Loader } from '@proofzero/design-system/src/molecules/loader/Loader'
import { useEffect, useState } from 'react'

import type { ActionFunction, LoaderFunction } from '@remix-run/cloudflare'
import {
  BadRequestError,
  ERROR_CODES,
  HTTP_STATUS_CODES,
} from '@proofzero/errors'
import { Button, Text } from '@proofzero/design-system'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { generateEmailOTP } from '~/utils/emailOTP'

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context, params }) => {
    const qp = new URL(request.url).searchParams

    const email = qp.get('email')
    const state = qp.get('state')
    if (!email)
      throw new BadRequestError({ message: 'No address included in request' })
    if (!state)
      throw new BadRequestError({ message: 'No state included in request' })

    return json({
      email,
      initialState: state,
      clientId: params.clientId,
    })
  }
)

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context, params }) => {
    const actionRes = await otpAction({ request, context, params })
    const { addressURN, successfulVerification } = await actionRes.json()

    if (successfulVerification) {
      const appData = await getAuthzCookieParams(request, context.env)
      const addressClient = getAddressClient(
        addressURN,
        context.env,
        context.traceSpan
      )

      const { accountURN, existing } = await addressClient.resolveAccount.query(
        {
          jwt: await getUserSession(request, context.env, appData?.clientId),
          force: !appData || appData.rollup_action !== 'connect',
        }
      )

      return authenticateAddress(
        addressURN,
        accountURN,
        appData,
        request,
        context.env,
        context.traceSpan,
        existing
      )
    }

    return json({ error: true })
  }
)

export default () => {
  const { prompt } = useOutletContext<{
    prompt?: string
  }>()

  const { email, initialState } = useLoaderData()
  const ad = useActionData()
  const submit = useSubmit()
  const navigate = useNavigate()
  const transition = useTransition()
  const fetcher = useFetcher()

  const [errorMessage, setErrorMessage] = useState('')
  const [state, setState] = useState(initialState)

  const generateAndValidateEmailOTP = async () => {
    try {
      const result = await generateEmailOTP(email)
      if (result?.status === HTTP_STATUS_CODES[ERROR_CODES.BAD_REQUEST]) {
        setErrorMessage(result.message)
      } else if (errorMessage.length) {
        // In the case error was hit in last call
        // here we want to reset the error message
        setErrorMessage('')
      }
      if (result?.state) {
        setState(result.state)
      }
    } catch (e: any) {
      setErrorMessage(e.message ? e.message : e.toString())
    }
  }

  return (
    <div
      className={
        'flex shrink flex-col items-center justify-center gap-4 mx-auto\
      bg-white p-6 h-[100dvh] lg:h-[580px] lg:max-h-[100dvh] w-full\
       lg:w-[418px] lg:border-rounded-lg dark:bg-gray-800 border border-[#D1D5DB] dark:border-gray-600'
      }
      style={{
        boxSizing: 'border-box',
      }}
    >
      {transition.state !== 'idle' && <Loader />}

      <EmailOTPValidator
        loading={transition.state !== 'idle' || fetcher.state !== 'idle'}
        email={email}
        state={state}
        invalid={ad?.error}
        requestRegeneration={async () => {
          await generateAndValidateEmailOTP()
        }}
        requestVerification={async (email, code, state) => {
          submit(
            {
              email,
              code,
              state,
            },
            {
              method: 'post',
            }
          )
        }}
        goBack={() => history.back()}
      >
        {errorMessage ? (
          <Text
            size="sm"
            weight="medium"
            className="text-red-500 mt-4 mb-2 text-center"
          >
            {errorMessage}
          </Text>
        ) : undefined}
      </EmailOTPValidator>

      {prompt && (
        <div className="flex flex-1 w-full items-end">
          <Button
            btnSize="l"
            btnType="secondary-alt-skin"
            className="w-full hover:bg-gray-100"
            onClick={() => navigate('/authenticate/cancel')}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  )
}
