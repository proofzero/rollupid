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
import { AuthButton } from '@proofzero/design-system/src/molecules/auth-button/AuthButton'
import { getAccountClient } from '~/platform.server'
import {
  getAuthzCookieParams,
  getUserSession,
  parseJwt,
} from '~/session.server'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'
import Authentication from '@proofzero/design-system/src/templates/authentication/Authentication'

export const loader: LoaderFunction = async ({ request, context, params }) => {
  const jwt = await getUserSession(request, context.env, params.clientId)
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
  const authzCookieParams = await getAuthzCookieParams(
    request,
    context.env,
    params.clientId
  )

  const { redirectUri, state, scope, clientId, prompt } = authzCookieParams

  const qp = new URLSearchParams()
  qp.append('client_id', clientId)
  qp.append('redirect_uri', redirectUri)
  qp.append('state', state)
  qp.append('scope', scope.join(' '))

  if (prompt) qp.append('prompt', prompt)

  return redirect(`/authorize?${qp.toString()}`)
}

export default () => {
  const { profile } = useLoaderData()
  const { clientId, appProps } = useOutletContext<any>()

  const navigate = useNavigate()
  const submit = useSubmit()

  return (
    <Authentication
      logoURL={appProps?.iconURL}
      appName={appProps?.name}
      accountSelect={true}
    >
      <>
        <div className="relative">
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
                    className="w-full h-full rounded-full"
                    src={profile.pfp.image}
                    alt="PFP"
                  />
                )}
              </>
            }
            text={profile.displayName}
          />

          <div className="absolute z-10 right-0 top-0 bottom-0 flex flex-row-reverse justify-center items-center px-3">
            <Text
              size="xs"
              className="cursor-pointer text-gray-500"
              onClick={() => {
                navigate(
                  `/signout?redirect_uri=${new URL(
                    window.location.href
                  ).toString()}&client_id=${clientId}`
                )
              }}
            >
              Sign out
            </Text>
          </div>
        </div>

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

        {(appProps?.termsURL || appProps?.privacyURL) && (
          <Text size="sm" className="text-gray-500 mt-7">
            Before using this app, you can review {appProps?.name ?? `Company`}
            's{' '}
            <a href={appProps.privacyURL} className="text-indigo-500">
              privacy policy
            </a>
            {appProps?.termsURL && appProps?.privacyURL && <span> and </span>}
            <a href={appProps.termsURL} className="text-indigo-500">
              terms of service
            </a>
            .
          </Text>
        )}
      </>
    </Authentication>
  )
}
