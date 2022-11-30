import { ActionFunction, json, redirect } from '@remix-run/cloudflare'
import type { LoaderFunction } from '@remix-run/cloudflare'
import { useLoaderData, useSubmit } from '@remix-run/react'

import {
  getAccessClient,
  getAddressClient,
  getAddressClientFromURN,
  getGalaxyClient,
  getStabaseClient as getStarbaseClient,
} from '~/platform.server'
import { Authorization } from '~/components/authorization/Authorization'
import { getUserSession, parseJwt, requireJWT } from '~/session.server'
import { AccountURN } from '@kubelt/platform.account/src/types'
import { ResponseType } from '@kubelt/platform.access/src/types'

export const loader: LoaderFunction = async ({ request, context }) => {
  const url = new URL(request.url)
  const client_id = url.searchParams.get('client_id')
  const state = url.searchParams.get('state')

  if (!client_id) {
    throw json(
      { message: 'No app to authorize provided', isAuthenticated: true },
      400
    )
  }

  const session = await getUserSession(request)

  const galaxyClient = await getGalaxyClient()
  const profileRes = await galaxyClient.getProfile(undefined, {
    'KBT-Access-JWT-Assertion': session.get('jwt'),
  })

  let profile
  if (!profileRes.profile) {
    console.log('no profile found, creating one')
    const defaultProfileURN = session.get('defaultProfileUrn')
    const addressClient = getAddressClientFromURN(defaultProfileURN)
    profile = await addressClient.kb_getAddressProfile()
    if (!profile) {
      throw json("Couldn't find profile", 400)
    }
    const updated = await galaxyClient.updateProfile(
      { profile },
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

  // if profile is null we need to provisio a default profile
  // we can do that by getting the address profile and then setting the account profile
  // TODO: create a get address profile galaxy operation
  // TODO: call set profile mutation from galaxy

  try {
    const sbClient = getStarbaseClient()
    const scopeMeta = await sbClient.kb_appScopes()
    const appProfile = await sbClient.kb_appProfile(client_id)

    console.log({ scopes: scopeMeta.scopes })

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
    console.log({ cancel })
    return redirect(cancel)
  }

  const jwt = await requireJWT(request)

  const redirect_uri = form.get('redirect_uri') as string
  const scopes = (form.get('scopes') as string).split(',')
  const state = form.get('state') as string
  const client_id = form.get('client_id') as string

  const parsedJWT = parseJwt(jwt)

  const accessClient = getAccessClient()
  const authorizeRes = await accessClient.kb_authorize(
    `urn:threeid:account/${parsedJWT.sub}?+node_type=account` as AccountURN,
    client_id,
    redirect_uri,
    scopes,
    state,
    'code' as ResponseType
  )

  if (!authorizeRes) {
    throw json({ message: 'Failed to authorize' }, 400)
  }

  return redirect(
    `${redirect_uri}?code=${authorizeRes.code}&state=${authorizeRes.state}`
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
    console.log({ form })
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
