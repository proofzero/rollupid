import { json, redirect } from '@remix-run/cloudflare'
import type { LoaderFunction, ActionFunction } from '@remix-run/cloudflare'
import {
  useLoaderData,
  useOutletContext,
  useSubmit,
  useTransition,
} from '@remix-run/react'

import { ResponseType } from '@proofzero/types/access'

import { getAccessClient, getStarbaseClient } from '~/platform.server'
import { Authorization } from '~/components/authorization/Authorization'
import { getValidatedSessionContext } from '~/session.server'
import type { Profile } from '@proofzero/platform/account/src/types'
import { validatePersonaData } from '@proofzero/security/persona'
import { PersonaData } from '@proofzero/types/application'

export const loader: LoaderFunction = async ({ request, context }) => {
  const { clientId, redirectUri, scope, state } = context.consoleParams
  const { jwt, accountUrn } = await getValidatedSessionContext(
    request,
    context.consoleParams,
    context.env,
    context.traceSpan
  )

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
    if (!scope?.length || (scope.length == 1 && scope[0].trim() === 'openid')) {
      // auto authorize if no scope is provided or is set to only openid

      const responseType = ResponseType.Code
      const accessClient = getAccessClient(context.env, context.traceSpan)
      const authorizeRes = await accessClient.authorize.mutate({
        account: accountUrn,
        responseType,
        clientId,
        redirectUri,
        scope: scope || [],
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
    return redirect('/settings')
  }
  try {
    const sbClient = getStarbaseClient(jwt, context.env, context.traceSpan)

    // When scopes are powered by an index we can just query for the scopes we have in the app
    const [scopeMeta, appPublicProps] = await Promise.all([
      sbClient.getScopes.query(),
      sbClient.getAppPublicProps.query({
        clientId: clientId as string,
      }),
    ])

    return json({
      clientId,
      appProfile: appPublicProps,
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
  const { accountUrn } = await getValidatedSessionContext(
    request,
    context.consoleParams,
    context.env,
    context.traceSpan
  )

  const form = await request.formData()
  const cancel = form.get('cancel') as string

  if (cancel) {
    return redirect(cancel)
  }

  const responseType = ResponseType.Code
  const redirectUri = form.get('redirect_uri') as string
  const scope = (form.get('scopes') as string).split(',')
  /* This stores the selection made from the user in the authorization
  screen; gets validated and stored for later retrieval at token generation stage */
  const personaData = JSON.parse(
    form.get('personaData') as string
  ) as PersonaData
  const state = form.get('state') as string
  const clientId = form.get('client_id') as string

  if (!accountUrn || !responseType || !redirectUri || !scope || !state) {
    throw json({ message: 'Missing required fields' }, 400)
  }

  await validatePersonaData(
    accountUrn,
    personaData,
    {
      addressFetcher: context.env.Address,
    },
    context.traceSpan
  )

  const accessClient = getAccessClient(context.env, context.traceSpan)
  const authorizeRes = await accessClient.authorize.mutate({
    account: accountUrn,
    responseType,
    clientId,
    redirectUri,
    scope,
    personaData,
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

    /* TODO: implement hookup for dropdown selection. 
    form.append('personaData', JSON.stringify(personaData))

    Will need to be set in the Authorization component itself based on 
    user selection, having a structure as follows:
    const personaData: PersonaData = {
      email:
        '${selectedEmailAddressUrn}',
    }
     */

    submit(form, { method: 'post' })
  }

  return (
    <Authorization
      appProfile={appProfile}
      userProfile={userProfile}
      scopeMeta={scopeMeta.scopes}
      transition={transition.state}
      cancelCallback={cancelCallback}
      authorizeCallback={authorizeCallback}
    />
  )
}
