import { json, redirect } from '@remix-run/cloudflare'
import type { LoaderFunction, ActionFunction } from '@remix-run/cloudflare'
import { useLoaderData, useSubmit } from '@remix-run/react'

import { ResponseType } from '@kubelt/platform.access/src/types'

import {
  getAccessClient,
  getGalaxyClient,
  getStarbaseClient,
} from '~/platform.server'
import { Authorization } from '~/components/authorization/Authorization'
import { getUserSession, parseJwt, requireJWT } from '~/session.server'
import type { AccountURN } from '@kubelt/urns/account'
import type { AddressURN } from '@kubelt/urns/address'

export const loader: LoaderFunction = async ({ request, context }) => {
  const url = new URL(request.url)
  const client_id = url.searchParams.get('client_id')
  const state = url.searchParams.get('state')

  // this will redirect unauthenticated users to the auth page but maintain query params
  const jwt = await requireJWT(request)
  const session = await getUserSession(request)
  const defaultProfileURN = session.get('defaultProfileUrn') as AddressURN

  const galaxyClient = await getGalaxyClient()
  const profileRes = await galaxyClient.getProfileFromAddress(
    { addressURN: defaultProfileURN },
    {
      'KBT-Access-JWT-Assertion': jwt,
    }
  )
  const profile = profileRes.profileFromAddress

  if (!profile) {
    throw json({ message: 'No profile found', isAuthenticated: true }, 400)
  }

  // if no client id let's redirect to the first party app select page
  if (!client_id) {
    return redirect('/apps')
  }

  try {
    const sbClient = getStarbaseClient(jwt)

    const scopeMeta = await sbClient.getScopes.query()
    const appProfile = await sbClient.getAppProfile.query({ clientId: client_id })

    return json({
      clientId: client_id,
      appProfile,
      userProfile: profile,
      scopeMeta,
      state,
    })
  } catch (e) {
    console.error(e)
    throw json({ message: 'Failed to fetch application info' }, 400)
  }
}

export const action: ActionFunction = async ({ request, context }) => {
  const form = await request.formData()
  const cancel = form.get('cancel') as string

  if (cancel) {
    return redirect(cancel)
  }

  const jwt = await requireJWT(request)
  const parsedJWT = parseJwt(jwt)
  const account = parsedJWT.sub as AccountURN
  const responseType = ResponseType.Code
  const redirectUri = form.get('redirect_uri') as string
  const scope = (form.get('scopes') as string).split(',')
  const state = form.get('state') as string
  const clientId = form.get('client_id') as string

  if (!account || !responseType || !redirectUri || !scope || !state) {
    throw json({ message: 'Missing required fields' }, 400)
  }

  const accessClient = getAccessClient()
  const authorizeRes = await accessClient.authorize.mutate({
    account,
    responseType,
    clientId,
    redirectUri,
    scope,
    state,
  })

  if (!authorizeRes) {
    throw json({ message: 'Failed to authorize' }, 400)
  }

  return redirect(
    `${redirectUri}?code=${authorizeRes.code}&state=${authorizeRes.state}`
  )
}

export default function Authorize() {
  const { clientId, appProfile, userProfile, scopeMeta, state } =
    useLoaderData()
  const submit = useSubmit()

  const cancelCallback = () => {
    submit(
      {
        cancel: `${appProfile.redirectURI}?=error=access_denied&state=${state}`,
      },
      { method: 'post' }
    )
  }

  const authorizeCallback = async (scopes: string[]) => {
    const form = new FormData()
    form.append('scopes', scopes.join(','))
    form.append('state', state)
    form.append('client_id', clientId)
    form.append('redirect_uri', appProfile.redirectURI)
    submit(form, { method: 'post' })
  }

  return (
    <Authorization
      appProfile={appProfile}
      userProfile={userProfile}
      scopeMeta={scopeMeta.scopes}
      cancelCallback={cancelCallback}
      authorizeCallback={authorizeCallback}
    />
  )
}
