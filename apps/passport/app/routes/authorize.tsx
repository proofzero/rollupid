import { json, redirect } from '@remix-run/cloudflare'
import type { LoaderFunction, ActionFunction } from '@remix-run/cloudflare'
import {
  useLoaderData,
  useNavigate,
  useSubmit,
  useTransition,
} from '@remix-run/react'

import { ResponseType } from '@proofzero/types/access'
import {
  getAccessClient,
  getAccountClient,
  getStarbaseClient,
} from '~/platform.server'
import {
  createAuthzParamsCookieAndAuthenticate,
  destroyAuthzCookieParamsSession,
  getAuthzCookieParams,
  getValidatedSessionContext,
} from '~/session.server'
import { validatePersonaData } from '@proofzero/security/persona'

import {
  authzParamsMatch,
  createAuthzParamCookieAndCreate,
  getDataForScopes,
} from '~/utils/authorize.server'
import { useEffect, useState } from 'react'
import { BadRequestError, InternalServerError } from '@proofzero/errors'
import { JsonError } from '@proofzero/utils/errors'
import { AuthorizationControlSelection } from '@proofzero/types/application'
import useConnectResult from '@proofzero/design-system/src/hooks/useConnectResult'

import sideGraphics from '~/assets/auth-side-graphics.svg'
import { SYSTEM_IDENTIFIERS_SCOPES } from '@proofzero/security/scopes'
import type { ScopeDescriptor } from '@proofzero/security/scopes'
import type { AppPublicProps } from '@proofzero/platform/starbase/src/jsonrpc/validators/app'
import type { DataForScopes } from '~/utils/authorize.server'
import type { EmailSelectListItem } from '@proofzero/utils/getNormalisedConnectedAccounts'
import type { GetProfileOutputParams } from '@proofzero/platform/account/src/jsonrpc/methods/getProfile'

import type { AddressURN } from '@proofzero/urns/address'
import type { PersonaData } from '@proofzero/types/application'

import Authorization, {
  scopeIcons,
} from '@proofzero/design-system/src/templates/authorization/Authorization'

export type UserProfile = {
  displayName: string
  pfp: {
    image: string
    isToken: boolean
  }
}

export type LoaderData = {
  redirectUri: string
  appProfile: AppPublicProps
  scopeMeta: { scopes: Record<string, ScopeDescriptor> }
  state: string
  clientId: string
  scopeOverride: string[]
  redirectOverride: string
  dataForScopes: DataForScopes
  profile: GetProfileOutputParams
  prompt?: string
}

export const loader: LoaderFunction = async ({ request, context }) => {
  const { clientId, redirectUri, state, prompt, rollup_action } =
    context.authzQueryParams

  const connectResult =
    new URL(request.url).searchParams.get('rollup_result') ?? undefined

  //Request parameter pre-checks
  if (!clientId) throw new BadRequestError({ message: 'client_id is required' })
  if (!state) throw new BadRequestError({ message: 'state is required' })
  if (!redirectUri)
    throw new BadRequestError({ message: 'redirect_uri is required' })
  else {
    try {
      new URL(redirectUri)
    } catch {
      throw new BadRequestError({
        message: 'valid URI is required in redirect_uri param',
      })
    }
  }

  if (prompt && !['consent'].includes(prompt))
    throw new BadRequestError({
      message: 'The only prompt supported is "consent"',
    })

  if (
    rollup_action &&
    !['connect', 'create', 'reconnect'].includes(rollup_action)
  )
    throw new BadRequestError({
      message:
        'only Rollup action supported are connect, create, and reconnect ',
    })

  const lastCP = await getAuthzCookieParams(request, context.env)

  //If no authorization cookie and we're not logging into
  //Passport Settings, then we create authz cookie & authenticate/create

  if (
    !lastCP &&
    !(
      context.authzQueryParams.clientId === 'passport' &&
      context.authzQueryParams.redirectUri ===
        `${new URL(request.url).origin}/settings`
    ) &&
    connectResult !== 'CANCEL'
  ) {
    if (rollup_action === 'create') {
      await createAuthzParamCookieAndCreate(
        request,
        context.authzQueryParams,
        context.env
      )
    }

    await createAuthzParamsCookieAndAuthenticate(
      context.authzQueryParams,
      context.env
    )
  }

  const headers = new Headers()
  if (lastCP) {
    if (!authzParamsMatch(lastCP, context.authzQueryParams)) {
      await createAuthzParamsCookieAndAuthenticate(
        context.authzQueryParams,
        context.env
      )
    }

    headers.append(
      'Set-Cookie',
      await destroyAuthzCookieParamsSession(
        request,
        context.env,
        lastCP.clientId
      )
    )

    headers.append(
      'Set-Cookie',
      await destroyAuthzCookieParamsSession(request, context.env)
    )
  }

  const { jwt, accountUrn } = await getValidatedSessionContext(
    request,
    context.authzQueryParams,
    context.env,
    context.traceSpan
  )

  //Special case for console and passport - we just redirect
  if (['console', 'passport'].includes(clientId)) {
    const redirectURL = new URL(redirectUri)
    if (connectResult) {
      redirectURL.searchParams.set('rollup_result', connectResult)
    }

    return redirect(redirectURL.toString(), {
      headers,
    })
  }

  //Scope validation
  try {
    const sbClient = getStarbaseClient(jwt, context.env, context.traceSpan)
    const [scopeMeta, appPublicProps] = await Promise.all([
      sbClient.getScopes.query(),
      sbClient.getAppPublicProps.query({
        clientId: clientId as string,
      }),
    ])

    if (!appPublicProps.redirectURI)
      throw new BadRequestError({
        message: 'App requested does not have a configured redirect URL.',
      })
    const configuredUrl = new URL(appPublicProps.redirectURI)
    const providedUrl = redirectUri ? new URL(redirectUri) : configuredUrl

    if (!appPublicProps.scopes || !appPublicProps.scopes.length)
      throw new BadRequestError({
        message: 'No allowed scope was configured for the app',
      })

    if (providedUrl.origin !== configuredUrl.origin)
      throw new BadRequestError({
        message:
          'Provided redirect URI did not match with configured redirect URI',
      })

    // We need a unique set of scopes to avoid duplicates
    const scope = [...new Set(context.authzQueryParams.scope)]

    if (!scope || !scope.length)
      throw new BadRequestError({ message: 'No scope requested' })

    //If requested scope values are a subset of allowed scope values
    if (
      !scope.every((scopeValue) => appPublicProps.scopes.includes(scopeValue))
    )
      throw new BadRequestError({
        message:
          'Requested scope value not in the configured allowed scope list',
      })

    // Add generic system identifiers scope if any of the system identifiers scopes are requested
    if (
      scope.some((scope) => {
        return scopeMeta.scopes[scope].hidden === true
      })
    ) {
      scope.push('system_identifiers')
      scopeMeta.scopes['system_identifiers'] = {
        name: 'System Identifiers',
        description:
          "Read account's system identifiers and other non-personally identifiable information",
        class: 'implied',
      }
    }

    //Go through pre-authorization if not explicitly requested to prompt user for
    //consent through query params
    if (
      !(
        context.authzQueryParams.prompt &&
        context.authzQueryParams.prompt === 'consent'
      )
    ) {
      const responseType = ResponseType.Code
      const accessClient = getAccessClient(context.env, context.traceSpan)
      const preauthorizeRes = await accessClient.preauthorize.mutate({
        account: accountUrn,
        responseType,
        clientId,
        redirectUri,
        scope: scope,
        state,
      })

      if (preauthorizeRes.preauthorized) {
        const redirectParams = new URLSearchParams({
          code: preauthorizeRes.code,
          state: preauthorizeRes.state,
        })

        const redirectURL = new URL(redirectUri)
        for (const [key, value] of redirectParams) {
          redirectURL.searchParams.append(key, value)
        }

        return redirect(redirectURL.toString(), {
          headers,
        })
      } //else we present the authz screen below
    }
    const accountClient = getAccountClient(jwt, context.env, context.traceSpan)
    const profile = await accountClient.getProfile.query({
      account: accountUrn,
    })

    const dataForScopes = await getDataForScopes(
      scope,
      accountUrn,
      jwt,
      context.env,
      context.traceSpan
    )

    if (!profile) {
      throw new InternalServerError({
        message: 'No profile found for this account',
      })
    }

    return json<LoaderData>(
      {
        redirectUri,
        clientId,
        appProfile: appPublicProps,
        scopeMeta: scopeMeta,
        state,
        redirectOverride: redirectUri,
        scopeOverride: scope || [],
        dataForScopes,
        profile,
        prompt,
      },
      {
        headers,
      }
    )
  } catch (e) {
    console.error(e)
    throw JsonError(e)
  }
}

export const action: ActionFunction = async ({ request, context }) => {
  const { accountUrn } = await getValidatedSessionContext(
    request,
    context.authzQueryParams,
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
  const scope = (form.get('scopes') as string).split(' ')
  /* This stores the selection made from the user in the authorization
  screen; gets validated and stored for later retrieval at token generation stage */
  const personaData = JSON.parse(
    form.get('personaData') as string
  ) as PersonaData

  const state = form.get('state') as string
  const clientId = form.get('client_id') as string
  if (
    !accountUrn ||
    !responseType ||
    !redirectUri ||
    !scope ||
    !state ||
    !personaData
  ) {
    throw json({ message: 'Missing required fields' }, 400)
  }

  await validatePersonaData(
    accountUrn,
    personaData,
    {
      addressFetcher: context.env.Address,
      accountFetcher: context.env.Account,
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

  const redirectUrl = new URL(redirectUri)
  for (const [key, value] of redirectParams) {
    redirectUrl.searchParams.set(key, value)
  }

  return redirect(redirectUrl.toString())
}

export default function Authorize() {
  const {
    clientId,
    appProfile,
    scopeMeta,
    state,
    redirectOverride,
    dataForScopes,
    redirectUri,
    profile,
    prompt,
  } = useLoaderData<LoaderData>()

  const userProfile = profile as UserProfile

  const {
    connectedEmails,
    personaData,
    requestedScope,
    connectedAccounts,
    connectedSmartContractWallets,
  } = dataForScopes

  const [persona] = useState<PersonaData>(personaData!)

  const [selectedEmail, setSelectedEmail] = useState<EmailSelectListItem>()
  const [selectedConnectedAccounts, setSelectedConnectedAccounts] = useState<
    Array<AddressURN> | Array<AuthorizationControlSelection>
  >([])
  const [selectedSCWallets, setSelectedSCWallets] = useState<
    { nickname: string; address?: string }[]
  >([])

  // Re-render the component every time persona gets updated
  useEffect(() => {}, [persona])

  const submit = useSubmit()
  const navigate = useNavigate()
  const transition = useTransition()

  useConnectResult(['ALREADY_CONNECTED', 'CANCEL'])

  const cancelCallback = () => {
    const redirectURL = new URL(redirectUri)
    redirectURL.search = `?error=access_denied&state=${state}`

    submit(
      {
        cancel: redirectURL.toString(),
      },
      { method: 'post' }
    )
  }

  const authorizeCallback = async (scopes: string[]) => {
    const form = new FormData()
    form.append('scopes', scopes.join(' '))
    form.append('state', state)
    form.append('client_id', clientId)
    form.append('redirect_uri', redirectOverride)

    const personaData: any = {
      ...persona,
    }

    if (requestedScope.includes('email') && selectedEmail) {
      personaData.email = selectedEmail.addressURN
    }

    if (
      requestedScope.includes('connected_accounts') &&
      selectedConnectedAccounts.length > 0
    ) {
      if (selectedConnectedAccounts[0] === AuthorizationControlSelection.ALL) {
        personaData.connected_accounts = AuthorizationControlSelection.ALL
      } else {
        personaData.connected_accounts = selectedConnectedAccounts
      }
    }

    if (requestedScope.includes('erc_4337') && selectedSCWallets) {
      personaData.erc_4337 = selectedSCWallets
    }

    // TODO: Everything should be a form field now handled by javascript
    // This helps keeps things generic has if a form input is not present
    // it doesn't end up being submitted

    form.append('personaData', JSON.stringify(personaData))

    submit(form, { method: 'post' })
  }

  return (
    <div className={'flex flex-row h-[100dvh] justify-center items-center'}>
      <div
        className={
          'basis-2/5 h-[100dvh] w-full hidden lg:flex justify-center items-center bg-indigo-50 overflow-hidden'
        }
      >
        <img src={sideGraphics} alt="Background graphics" />
      </div>
      <div className={'basis-full basis-full lg:basis-3/5'}>
        <Authorization
          userProfile={{
            pfpURL: userProfile.pfp.image,
          }}
          appProfile={{
            name: appProfile.name,
            iconURL: appProfile.iconURL,
            privacyURL: appProfile.privacyURL!,
            termsURL: appProfile.termsURL!,
          }}
          requestedScope={requestedScope}
          scopeMeta={scopeMeta}
          scopeIcons={scopeIcons}
          transitionState={transition.state}
          connectedSmartContractWallets={connectedSmartContractWallets ?? []}
          addNewSmartWalletCallback={() => {
            const qp = new URLSearchParams()
            qp.append('scope', requestedScope.join(' '))
            qp.append('state', state)
            qp.append('client_id', clientId)
            qp.append('redirect_uri', redirectOverride)
            qp.append('rollup_action', 'create')
            qp.append('create_type', 'wallet')
            if (prompt) qp.append('prompt', prompt)

            return navigate(`/authorize?${qp.toString()}`)
          }}
          selectSmartWalletCallback={(wallet) => {
            setSelectedSCWallets([
              {
                nickname: wallet.title,
                address: wallet.cryptoAddress,
              },
            ])
          }}
          connectedEmails={connectedEmails ?? []}
          addNewEmailCallback={() => {
            const qp = new URLSearchParams()
            qp.append('scope', requestedScope.join(' '))
            qp.append('state', state)
            qp.append('client_id', clientId)
            qp.append('redirect_uri', redirectOverride)
            qp.append('rollup_action', 'connect')
            qp.append('login_hint', 'email microsoft google apple')
            if (prompt) qp.append('prompt', prompt)

            return navigate(`/authorize?${qp.toString()}`)
          }}
          selectEmailCallback={setSelectedEmail}
          connectedAccounts={connectedAccounts ?? []}
          addNewAccountCallback={() => {
            const qp = new URLSearchParams()
            qp.append('scope', requestedScope.join(' '))
            qp.append('state', state)
            qp.append('client_id', clientId)
            qp.append('redirect_uri', redirectOverride)
            qp.append('rollup_action', 'connect')
            if (prompt) qp.append('prompt', prompt)

            return navigate(`/authorize?${qp.toString()}`)
          }}
          selectAccountsCallback={setSelectedConnectedAccounts}
          cancelCallback={cancelCallback}
          authorizeCallback={authorizeCallback}
          disableAuthorize={
            // TODO: make generic!
            (requestedScope.includes('email') &&
              (!connectedEmails?.length || !selectedEmail)) ||
            (requestedScope.includes('connected_accounts') &&
              !selectedConnectedAccounts?.length) ||
            (requestedScope.includes('erc_4337') && !selectedSCWallets.length)
          }
        />
      </div>
    </div>
  )
}
