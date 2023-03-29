import { ActionFunction, json, LoaderFunction } from '@remix-run/cloudflare'
import { action as otpAction } from '~/routes/connect/email/otp'
import { EmailOTPValidator } from '@proofzero/design-system/src/molecules/email-otp-validator'
import {
  Outlet,
  useActionData,
  useLoaderData,
  useMatches,
  useNavigate,
  useSubmit,
  useTransition,
} from '@remix-run/react'
import {
  getConsoleParamsSession,
  getJWTConditionallyFromSession,
} from '~/session.server'
import { getAddressClient } from '~/platform.server'
import { authenticateAddress } from '~/utils/authenticate.server'
import { Loader } from '@proofzero/design-system/src/molecules/loader/Loader'

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
    const appData = await getConsoleParamsSession(request, context.env)
      .then((session) => JSON.parse(session.get('params')))
      .catch(() => null)

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

  const navigate = useNavigate()
  const transition = useTransition()

  const submit = useSubmit()

  const matches = useMatches()
  const indexMatch = matches.find(
    (m) => m.id === 'routes/authenticate/$clientId/email/verify/index'
  )
  const matchData = indexMatch?.data

  return (
    <div
      className={
        'flex shrink flex-col items-center justify-center gap-4 mx-auto bg-white p-6 h-[100dvh] lg:h-[675px] lg:max-h-[100dvh] w-full lg:w-[418px] lg:border-rounded-lg'
      }
      style={{
        border: '1px solid #D1D5DB',
        boxSizing: 'border-box',
      }}
    >
      {transition.state !== 'idle' && <Loader />}

      <EmailOTPValidator
        loading={transition.state !== 'idle'}
        email={address}
        state={matchData?.state}
        invalid={ad?.error}
        requestRegeneration={() => navigate(`?address=${address}`)}
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
        {transition.state === 'idle' ? <Outlet /> : undefined}
      </EmailOTPValidator>
    </div>
  )
}
