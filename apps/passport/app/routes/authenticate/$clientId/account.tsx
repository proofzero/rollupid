import { AccountURN } from '@proofzero/urns/account'
import {
  ActionFunction,
  LoaderFunction,
  json,
  redirect,
} from '@remix-run/cloudflare'
import {
  useLoaderData,
  useNavigate,
  useOutletContext,
  useSubmit,
} from '@remix-run/react'
import { HiCheck } from 'react-icons/hi'
import { Authentication } from '~/components'
import AuthButton from '~/components/connect-button/AuthButton'
import { getAccountClient } from '~/platform.server'
import { getConsoleParams, getUserSession, parseJwt } from '~/session.server'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'

export const loader: LoaderFunction = async ({ request, context, params }) => {
  const session = await getUserSession(request, context.env, params.clientId)

  const jwt = session.get('jwt')
  if (!jwt) {
    const url = new URL(request.url)
    const qpString = url.searchParams.toString()

    return redirect(
      `/authenticate/${params.clientId}${qpString !== '' ? `?${qpString}` : ''}`
    )
  }

  const account = parseJwt(jwt).sub as AccountURN
  const accountClient = getAccountClient(jwt, context.env, context.traceSpan)
  const profile = await accountClient.getProfile.query({ account })

  return json({
    profile,
  })
}

export const action: ActionFunction = async ({ request, context, params }) => {
  const consoleParams = await getConsoleParams(
    request,
    context.env,
    params.clientId
  )

  const { redirectUri, state, scope, clientId } = consoleParams

  const qp = new URLSearchParams()
  qp.append('client_id', clientId)
  qp.append('redirect_uri', redirectUri)
  qp.append('state', state)
  qp.append('scope', scope.join(' '))

  return redirect(`/authorize?${qp.toString()}`)
}

export default () => {
  const { profile } = useLoaderData()
  const { clientId, appProps } = useOutletContext<any>()

  const navigate = useNavigate()
  const submit = useSubmit()

  return (
    <Authentication logoURL={appProps?.iconURL} appName={appProps?.name}>
      <>
        <AuthButton
          onClick={() => {
            submit(
              {},
              {
                method: 'post',
              }
            )
          }}
          Graphic={
            <>
              {profile.pfp?.image && (
                <img
                  className="w-6 h-6 rounded-full"
                  src={profile.pfp.image}
                  alt="PFP"
                />
              )}
            </>
          }
          text={profile.displayName}
          Addon={<HiCheck className="w-3.5 h-3.5 text-indigo-500" />}
        />

        <div className="my-1 flex flex-row items-center justify-center space-x-3">
          <hr className="h-px w-16 bg-gray-500" />
          <Text>or</Text>
          <hr className="h-px w-16 bg-gray-500" />
        </div>

        <AuthButton
          text="Choose other account"
          onClick={() => {
            navigate(`/authenticate/${clientId}`)
          }}
        />
      </>
    </Authentication>
  )
}
