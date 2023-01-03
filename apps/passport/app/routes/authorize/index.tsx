import { json, redirect } from '@remix-run/cloudflare'
import type { LoaderFunction, ActionFunction } from '@remix-run/cloudflare'
import { useLoaderData, useSubmit } from '@remix-run/react'

import { ResponseType } from '@kubelt/platform.access/src/types'

import {
  getAccessClient,
  getAddressClient,
  getGalaxyClient,
  getStarbaseClient,
} from '~/platform.server'
import { Authorization } from '~/components/authorization/Authorization'
import { getUserSession, parseJwt, requireJWT } from '~/session.server'
import { AccountURN } from '@kubelt/urns/account'

export const loader: LoaderFunction = async ({ request, context }) => {
  const url = new URL(request.url)
  const client_id = url.searchParams.get('client_id')
  const state = url.searchParams.get('state')

  // this will redirect unauthenticated users to the auth page but maintain query params
  const jwt = await requireJWT(request)
  const session = await getUserSession(request)

  const galaxyClient = await getGalaxyClient()
  const profileRes = await galaxyClient.getProfile(undefined, {
    'KBT-Access-JWT-Assertion': jwt,
  })

  let profile
  if (!profileRes.profile) {
    console.log('no profile found, creating one')
    const defaultProfileURN = session.get('defaultProfileUrn')
    const addressClient = getAddressClient(defaultProfileURN)
    profile = await addressClient.kb_getAddressProfile() // this will detect the kind of address
    if (!profile) {
      throw json("Couldn't find profile", 400)
    }
    const updated = await galaxyClient.updateProfile(
      { profile: { ...profile, defaultAddress: defaultProfileURN } },
      {
        'KBT-Access-JWT-Assertion': session.get('jwt'),
      }
    )
    if (!updated) {
      throw json("Couldn't update profile", 400)
    }
  } else {
    profile = profileRes.profile
  }

  if (!profile) {
    throw json({ message: 'No profile found', isAuthenticated: true }, 400)
  }

  // if no client id let's redirect to the first party app select page
  if (!client_id) {
    return redirect('/apps')
  }

  // if profile is null we need to provision a default profile
  // we can do that by getting the address profile and then setting the account profile
  // TODO: create a get address profile galaxy operation
  // TODO: call set profile mutation from galaxy

  try {
    const sbClient = getStarbaseClient()

    // ======================= TEMPOARY =======================
    const ids = await sbClient.kb_initPlatform() // TODO: temporary until console is complete
    console.log('ids', ids)
    // ======================= TEMPOARY =======================

    const scopeMeta = await sbClient.kb_appScopes()
    const appProfile = await sbClient.kb_appProfile(client_id)

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
