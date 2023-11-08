import { json, redirect } from '@remix-run/cloudflare'
import { action as otpAction } from '~/routes/connect/email/otp'
import { EmailOTPValidator } from '@proofzero/design-system/src/molecules/email-otp-validator'
import {
  useActionData,
  useFetcher,
  useLoaderData,
  useNavigate,
  useOutletContext,
  useSubmit,
  useTransition,
} from '@remix-run/react'
import {
  getAuthzCookieParams,
  getUserSession,
  getValidatedSessionContext,
} from '~/session.server'
import { getCoreClient } from '~/platform.server'
import {
  authenticateAccount,
  getAuthzRedirectURL,
} from '~/utils/authenticate.server'
import { useState } from 'react'

import type { ActionFunction, LoaderFunction } from '@remix-run/cloudflare'
import {
  BadRequestError,
  ERROR_CODES,
  HTTP_STATUS_CODES,
  UnauthorizedError,
} from '@proofzero/errors'
import { Button, Text } from '@proofzero/design-system'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { generateEmailOTP } from '~/utils/emailOTP'
import {
  IdentityGroupURN,
  IdentityGroupURNSpace,
} from '@proofzero/urns/identity-group'

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, params }) => {
    const cfReq = request as {
      cf?: {
        botManagement: {
          score: number
        }
      }
    }
    const isBot =
      cfReq.cf &&
      cfReq.cf.botManagement.score <= 89 &&
      !['localhost', '127.0.0.1'].includes(new URL(request.url).hostname)

    const qp = new URL(request.url).searchParams

    const email = qp.get('email')
    const state = qp.get('state')
    if (!email)
      throw new BadRequestError({ message: 'No address included in request' })
    if (!state)
      throw new BadRequestError({ message: 'No state included in request' })

    const code = qp.get('code')

    return json({
      email,
      initialState: state,
      clientId: params.clientId,
      code,
      isBot,
    })
  }
)

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context, params }) => {
    const actionRes = await otpAction({ request, context, params })
    const { accountURN, successfulVerification } = await actionRes.json()

    if (successfulVerification) {
      const appData = await getAuthzCookieParams(request, context.env)
      let coreClient = getCoreClient({ context, accountURN })

      if (appData?.rollup_action?.startsWith('groupemailconnect')) {
        const { jwt } = await getValidatedSessionContext(
          request,
          context.authzQueryParams,
          context.env,
          context.traceSpan
        )

        if (!jwt) {
          throw new UnauthorizedError({
            message: 'No JWT in session context',
          })
        }

        coreClient = getCoreClient({
          context,
          jwt,
        })

        let result = undefined

        const identityGroupID = appData.rollup_action.split('_')[1]
        const identityGroupURN = IdentityGroupURNSpace.urn(
          identityGroupID as string
        ) as IdentityGroupURN

        const { existing } =
          await coreClient.account.connectIdentityGroupEmail.mutate({
            accountURN: accountURN,
            identityGroupURN,
          })

        if (existing) {
          result = 'ALREADY_CONNECTED_ERROR'
        }

        const redirectURL = getAuthzRedirectURL(appData, result)

        return redirect(redirectURL)
      }

      const { identityURN, existing } =
        await coreClient.account.resolveIdentity.query({
          jwt: await getUserSession(request, context.env, appData?.clientId),
          force:
            !appData ||
            (appData.rollup_action !== 'connect' &&
              !appData.rollup_action?.startsWith('groupconnect')),
          clientId: appData?.clientId,
        })

      return authenticateAccount(
        accountURN,
        identityURN,
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

  const { email, initialState, code, isBot } = useLoaderData()
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
        'flex shrink flex-col items-center\
        gap-4 mx-auto bg-white p-6 h-[100dvh]\
        lg:h-[580px] lg:max-h-[100dvh] w-full lg:w-[418px]\
        lg:rounded-lg dark:bg-gray-800 border border-[#D1D5DB] dark:border-gray-600'
      }
      style={{
        boxSizing: 'border-box',
      }}
    >
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
        autoVerify={!isBot}
        code={code}
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
