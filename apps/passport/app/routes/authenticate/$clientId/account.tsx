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
import { getAccountClient } from '~/platform.server'
import {
  getAuthzCookieParams,
  getUserSession,
  parseJwt,
} from '~/session.server'
import AccountSelect from '@proofzero/design-system/src/templates/authentication/AccountSelect'

function redirectToAuthentication(
  request: Request,
  clientId: string | undefined
) {
  const url = new URL(request.url)
  const qpString = url.searchParams.toString()

  return redirect(
    `/authenticate/${clientId}${qpString !== '' ? `?${qpString}` : ''}`
  )
}

export const loader: LoaderFunction = async ({ request, context, params }) => {
  const jwt = await getUserSession(request, context.env, params.clientId)
  if (!jwt) return redirectToAuthentication(request, params.clientId)

  const account = parseJwt(jwt).sub as AccountURN
  const accountClient = getAccountClient(jwt, context.env, context.traceSpan)
  const profile = await accountClient.getProfile.query({ account })
  if (!profile) return redirectToAuthentication(request, params.clientId)
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
    <AccountSelect
      logoURL={appProps?.iconURL}
      appProfile={{
        iconURL: appProps?.iconURL,
        name: appProps?.name,
        termsURL: appProps?.termsURL,
        privacyURL: appProps?.privacyURL,
        websiteURL: appProps?.websiteURL,
      }}
      userProfile={{
        pfpURL: profile?.pfp.image,
        displayName: profile?.displayName,
      }}
      onAuth={() => {
        submit(
          {},
          {
            method: 'post',
          }
        )
      }}
      onSignOut={() => {
        navigate(
          `/signout?redirect_uri=${new URL(
            window.location.href
          ).toString()}&client_id=${clientId}`
        )
      }}
      onChooseOther={() => {
        navigate(
          `/signout?redirect_uri=${new URL(
            window.location.href
          ).toString()}&client_id=${clientId}`
        )
      }}
    />
  )
}
