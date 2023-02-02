import { json, redirect } from '@remix-run/cloudflare'
import type { LoaderFunction, ActionFunction } from '@remix-run/cloudflare'
import {
  useLoaderData,
  useOutletContext,
  useSubmit,
  useTransition,
} from '@remix-run/react'

import { ResponseType } from '@kubelt/platform.access/src/types'

import { getAccessClient, getStarbaseClient } from '~/platform.server'
import { Authorization } from '~/components/authorization/Authorization'
import { parseJwt, requireJWT } from '~/session.server'
import type { AccountURN } from '@kubelt/urns/account'
import { Profile } from '@kubelt/galaxy-client'

export const loader: LoaderFunction = async ({ request, context }) => {
  const { clientId, redirectUri, scope, state } = context.consoleParams
  const jwt = await requireJWT(request, context.consoleParams, context.env)

  if (clientId) {
    if (!state) throw json({ message: 'state is required' }, 400)
    if (!redirectUri) throw json({ message: 'redirect_uri is required' }, 400)
    try {
      new URL(redirectUri)
    } catch {
      throw json(
        { message: 'valid URI is required in redirect_uri param' },
        400
      )
    }
    if (!scope || scope.trim() === '') {
      // auto authorize if no scope is provided

      const parsedJWT = parseJwt(jwt)
      const account = parsedJWT.sub as AccountURN
      const responseType = ResponseType.Code
      const accessClient = getAccessClient(context.env)
      const authorizeRes = await accessClient.authorize.mutate({
        account,
        responseType,
        clientId,
        redirectUri,
        scope: [],
        state,
      })

      if (!authorizeRes) {
        throw json({ message: 'Failed to authorize' }, 400)
      }

      const redirectParams = new URLSearchParams({
        code: authorizeRes.code,
        state: authorizeRes.state,
      })

      return redirect(`${redirectUri}?${redirectParams}`)
    }
  } else {
    //TODO: remove this when implementing scopes and authz
    return redirect(context.env.CONSOLE_APP_URL)
  }
  try {
    const sbClient = getStarbaseClient(jwt, context.env)

    // When scopes are powered by an index we can just query for the scopes we have in the app
    const [scopeMeta, appProfile] = await Promise.all([
      sbClient.getScopes.query(),
      sbClient.getAppProfile.query({
        clientId: clientId as string,
      }),
    ])

    return json({
      clientId,
      appProfile,
      scopeMeta: scopeMeta,
      state,
      redirectOverride: redirectUri,
      scopeOverride: scope,
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

  const jwt = await requireJWT(request, context.consoleParams, context.env)
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

  const accessClient = getAccessClient(context.env)
  const authorizeRes = await accessClient.authorize.mutate({
    account,
    responseType,
    clientId,
    redirectUri,
    scope,
    state,
  })

  console.log({ authorizeRes })

  if (!authorizeRes) {
    throw json({ message: 'Failed to authorize' }, 400)
  }

  const redirectParams = new URLSearchParams({
    code: authorizeRes.code,
    state: authorizeRes.state,
  })

  return redirect(`${redirectUri}?${redirectParams}`)
}

export default function Authorize() {
  const {
    clientId,
    appProfile,
    scopeMeta,
    state,
    redirectOverride,
    scopeOverride,
  } = useLoaderData()

  const { profile: userProfile } = useOutletContext<{
    profile: Required<Profile>
  }>()

  const submit = useSubmit()
  const transition = useTransition()

  console.log({ clientId, appProfile, userProfile, scopeMeta, state })

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
    form.append('scopes', scopes ? scopes.join(',') : scopeOverride)
    form.append('state', state)
    form.append('client_id', clientId)
    form.append('redirect_uri', redirectOverride)
    submit(form, { method: 'post' })
  }

  return (
    <Authorization
      appProfile={appProfile.app}
      userProfile={userProfile}
      scopeMeta={scopeMeta.scopes}
      transition={transition.state}
      cancelCallback={cancelCallback}
      authorizeCallback={authorizeCallback}
    />
  )
}
