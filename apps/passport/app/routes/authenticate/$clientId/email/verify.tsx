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
import {
  getConsoleParams,
  getJWTConditionallyFromSession,
} from '~/session.server'
import { getAddressClient } from '~/platform.server'
import { authenticateAddress } from '~/utils/authenticate.server'
import { Loader } from '@proofzero/design-system/src/molecules/loader/Loader'
import { useEffect, useState } from 'react'

import type { ActionFunction, LoaderFunction } from '@remix-run/cloudflare'
import { ERROR_CODES, HTTP_STATUS_CODES } from '@proofzero/errors'
import { Button, Text } from '@proofzero/design-system'

export const loader: LoaderFunction = async ({ request, context, params }) => {
  const qp = new URL(request.url).searchParams

  const email = qp.get('email')
  if (!email) throw new Error('No address included in request')

  return json({
    email,
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
      force: !appData || appData.prompt !== 'connect',
    })

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

export default () => {
  const { connectFlow } = useOutletContext<{
    connectFlow: boolean
  }>()

  const { email, clientId } = useLoaderData()
  const ad = useActionData()
  const submit = useSubmit()
  const navigate = useNavigate()
  const transition = useTransition()
  const location = useLocation()
  const fetcher = useFetcher()

  const [errorMessage, setErrorMessage] = useState('')
  const [state, setState] = useState('')
  const [lastRegen, setLastRegen] = useState(Date.now())

  useEffect(() => {
    ;(async () => {
      try {
        const resObj = await fetch('/connect/email/otp' + location.search)
        const res = await resObj.json<{
          message: string
          state: string
        }>()

        if (resObj.status === HTTP_STATUS_CODES[ERROR_CODES.BAD_REQUEST]) {
          setErrorMessage(res.message)
        } else if (errorMessage.length) {
          // In the case error was hit in last call
          // here we want to reset the error message
          setErrorMessage('')
        }
        setState(res.state)
      } catch (e: any) {
        setErrorMessage(e.message ? e.message : e.toString())
      }
    })()
  }, [errorMessage.length, lastRegen, location.search])

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
        email={email}
        state={state}
        invalid={ad?.error}
        requestRegeneration={async () => {
          setLastRegen(Date.now())
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

      {connectFlow && (
        <div className="flex flex-1 w-full items-end">
          <Button
            btnSize="l"
            btnType="secondary-alt"
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
