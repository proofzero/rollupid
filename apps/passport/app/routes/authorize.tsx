import { json, redirect } from '@remix-run/cloudflare'
import type {
  LoaderFunction,
  ActionFunction,
  MetaFunction,
} from '@remix-run/cloudflare'
import {
  useLoaderData,
  useNavigate,
  useSubmit,
  useTransition,
} from '@remix-run/react'

import { ResponseType } from '@proofzero/types/access'
import { getCoreClient } from '~/platform.server'
import {
  createAuthzParamsCookieAndAuthenticate,
  destroyAuthzCookieParamsSession,
  getAuthzCookieParams,
  getValidatedSessionContext,
  isSupportedRollupAction,
} from '~/session.server'
import { validatePersonaData } from '@proofzero/security/persona'

import {
  authzParamsMatch,
  createAuthzParamCookieAndCreate,
  createNewSCWallet,
  getDataForScopes,
} from '~/utils/authorize.server'
import { useContext, useEffect, useState } from 'react'
import { BadRequestError, InternalServerError } from '@proofzero/errors'
import { AuthorizationControlSelection } from '@proofzero/types/application'
import useConnectResult from '@proofzero/design-system/src/hooks/useConnectResult'

import sideGraphics from '~/assets/auth-side-graphics.svg'
import type { ScopeDescriptor } from '@proofzero/security/scopes'
import type { AppPublicProps } from '@proofzero/platform/starbase/src/jsonrpc/validators/app'
import type { DataForScopes } from '~/utils/authorize.server'
import type { GetProfileOutputParams } from '@proofzero/platform/account/src/jsonrpc/methods/getProfile'

import type { PersonaData } from '@proofzero/types/application'

import Authorization from '@proofzero/design-system/src/templates/authorization/Authorization'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { getEmailIcon } from '@proofzero/utils/getNormalisedConnectedAccounts'
import { ThemeContext } from '@proofzero/design-system/src/contexts/theme'
import { AuthenticationScreenDefaults } from '@proofzero/design-system/src/templates/authentication/Authentication'
import { Helmet } from 'react-helmet'
import { getRGBColor, getTextColor } from '@proofzero/design-system/src/helpers'
import { AddressURNSpace } from '@proofzero/urns/address'
import type { DropdownSelectListItem } from '@proofzero/design-system/src/atoms/dropdown/DropdownSelectList'
import { createAnalyticsEvent } from '@proofzero/utils/analytics'

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

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const { clientId, redirectUri, state, prompt, rollup_action } =
      context.authzQueryParams

    const connectResult =
      new URL(request.url).searchParams.get('rollup_result') ?? undefined

    //Request parameter pre-checks
    if (!clientId)
      throw new BadRequestError({ message: 'client_id is required' })
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

    if (rollup_action && !isSupportedRollupAction(rollup_action))
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
        request,
        context.authzQueryParams,
        context.env
      )
    }

    const headers = new Headers()
    if (lastCP) {
      if (!authzParamsMatch(lastCP, context.authzQueryParams)) {
        await createAuthzParamsCookieAndAuthenticate(
          request,
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
    const coreClient = getCoreClient({ context, jwt })

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
    const [scopeMeta, appPublicProps] = await Promise.all([
      coreClient.starbase.getScopes.query(),
      coreClient.starbase.getAppPublicProps.query({
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

    //Go through pre-authorization if not explicitly requested to prompt user for
    //consent through query params
    if (
      !(
        context.authzQueryParams.prompt &&
        context.authzQueryParams.prompt === 'consent'
      )
    ) {
      const responseType = ResponseType.Code
      const preauthorizeRes = await coreClient.access.preauthorize.mutate({
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

    const [profile, personaData, dataForScopes] = await Promise.all([
      coreClient.account.getProfile.query({
        account: accountUrn,
      }),
      coreClient.access.getPersonaData.query({
        accountUrn,
        clientId,
      }),
      getDataForScopes(scope, accountUrn, jwt, context.env, context.traceSpan),
    ])

    if (personaData) {
      dataForScopes.personaData = personaData
    }

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
  }
)

export const action: ActionFunction = async ({ request, context }) => {
  const { jwt, accountUrn } = await getValidatedSessionContext(
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

  const createSCWallet = form.get('createSCWallet') as string

  const coreClient = getCoreClient({ context, jwt })

  if (createSCWallet?.length) {
    const nickname = JSON.parse(createSCWallet).nickname
    const profile = await coreClient.account.getProfile.query({
      account: accountUrn,
    })

    const { addressURN } = await createNewSCWallet({
      nickname,
      primaryAddressURN: profile?.primaryAddressURN!,
      env: context.env,
      traceSpan: context.traceSpan,
    })

    personaData.erc_4337 = [AddressURNSpace.getBaseURN(addressURN)]
  }

  await validatePersonaData(
    accountUrn,
    personaData,
    context.env.Core,
    context.traceSpan
  )

  const authorizeRes = await coreClient.access.authorize.mutate({
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

  await createAnalyticsEvent({
    eventName: 'app_authorized',
    distinctId: accountUrn,
    apiKey: context.env.POSTHOG_API_KEY,
    groups: {
      app: clientId,
    },
    properties: {
      clientId: clientId,
      scope: scope,
    },
  })

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

export const meta: MetaFunction = ({ data }) => {
  return {
    charset: 'utf-8',
    title: 'Passport - Rollup',
    viewport: 'width=device-width,initial-scale=1',
    'og:url': 'https://passport.rollup.id',
    'og:title': 'Passport - Rollup',
    'og:description': 'Simple & Secure Private Auth',
    'og:image':
      'https://uploads-ssl.webflow.com/63d2527457e052627d01c416/64c91dd58d5781fa9a23ea85_OG%20(2).png',
    'twitter:card': 'summary_large_image',
    'twitter:site': '@rollupid_xyz',
    'twitter:creator': '@rollupid_xyz',
    'twitter:image':
      'https://uploads-ssl.webflow.com/63d2527457e052627d01c416/64c91dd58d5781fa9a23ea85_OG%20(2).png',
    'theme-color': '#ffffff',
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
  }
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
  } = dataForScopes as DataForScopes

  const [persona] = useState<PersonaData>(personaData!)

  const [selectedEmail, setSelectedEmail] = useState<
    DropdownSelectListItem | undefined
  >(() => {
    let selected
    if (connectedEmails && connectedEmails.length && persona?.email) {
      selected = connectedEmails.find((email) => email.value === persona.email)
    } else {
      // sorted in edges in  by date descending order
      selected = connectedEmails?.[connectedEmails.length - 1]
    }
    return selected
  })
  const [selectedConnectedAccounts, setSelectedConnectedAccounts] = useState<
    Array<DropdownSelectListItem> | Array<AuthorizationControlSelection>
  >(() => {
    if (persona.connected_accounts === AuthorizationControlSelection.ALL) {
      return [AuthorizationControlSelection.ALL]
    } else {
      return connectedAccounts?.length
        ? connectedAccounts.filter((acc) =>
            persona.connected_accounts?.includes(acc.value)
          )
        : []
    }
  })
  const [selectedSCWallets, setSelectedSCWallets] = useState<
    Array<DropdownSelectListItem> | Array<AuthorizationControlSelection>
  >(() => {
    if (persona.erc_4337 === AuthorizationControlSelection.ALL) {
      return [AuthorizationControlSelection.ALL]
    } else {
      return connectedSmartContractWallets?.length
        ? connectedSmartContractWallets.filter((acc) =>
            persona.erc_4337?.includes(acc.value)
          )
        : []
    }
  })

  // Re-render the component every time persona gets updated
  useEffect(() => {}, [persona])

  const submit = useSubmit()
  const navigate = useNavigate()
  const transition = useTransition()

  useConnectResult()

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
      personaData.email = selectedEmail.value
    }

    if (
      requestedScope.includes('connected_accounts') &&
      selectedConnectedAccounts.length > 0
    ) {
      if (selectedConnectedAccounts[0] === AuthorizationControlSelection.ALL) {
        personaData.connected_accounts = AuthorizationControlSelection.ALL
      } else {
        personaData.connected_accounts = selectedConnectedAccounts.map(
          (account) => (account as DropdownSelectListItem).value
        )
      }
    }

    if (requestedScope.includes('erc_4337')) {
      if (selectedSCWallets?.length > 0) {
        if (selectedSCWallets[0] === AuthorizationControlSelection.ALL) {
          personaData.erc_4337 = AuthorizationControlSelection.ALL
        } else {
          personaData.erc_4337 = selectedSCWallets.map(
            (wallet) => (wallet as DropdownSelectListItem).value
          )
        }
      } else {
        form.append(
          'createSCWallet',
          JSON.stringify({
            check: true,
            nickname: appProfile.name,
          })
        )
      }
    }

    // TODO: Everything should be a form field now handled by javascript
    // This helps keeps things generic has if a form input is not present
    // it doesn't end up being submitted

    form.append('personaData', JSON.stringify(personaData))

    submit(form, { method: 'post' })
  }

  const { dark } = useContext(ThemeContext)

  return (
    <>
      <Helmet>
        <style type="text/css">{`
            :root {
                ${getRGBColor(
                  dark
                    ? appProfile?.appTheme?.color?.dark ??
                        AuthenticationScreenDefaults.color.dark
                    : appProfile?.appTheme?.color?.light ??
                        AuthenticationScreenDefaults.color.light,
                  'primary'
                )}
                ${getRGBColor(
                  getTextColor(
                    dark
                      ? appProfile?.appTheme?.color?.dark ??
                          AuthenticationScreenDefaults.color.dark
                      : appProfile?.appTheme?.color?.light ??
                          AuthenticationScreenDefaults.color.light
                  ),
                  'primary-contrast-text'
                )}
             {
         `}</style>
      </Helmet>

      <div className={`${dark ? 'dark' : ''}`}>
        <div
          className={
            'flex flex-row h-[100dvh] justify-center items-center bg-[#F9FAFB] dark:bg-gray-900'
          }
        >
          <div
            className={
              'basis-2/5 h-[100dvh] w-full hidden lg:flex justify-center items-center bg-indigo-50 dark:bg-[#1F2937] overflow-hidden'
            }
            style={{
              backgroundImage: `url(${
                appProfile?.appTheme?.graphicURL ?? sideGraphics
              })`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          ></div>
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
              transitionState={transition.state}
              connectedSmartContractWallets={
                connectedSmartContractWallets ?? []
              }
              selectedSCWallets={selectedSCWallets}
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
              selectSmartWalletsCallback={setSelectedSCWallets}
              selectAllSmartWalletsCallback={setSelectedSCWallets}
              connectedEmails={
                connectedEmails.map((email) => {
                  // Substituting subtitle with icon
                  // on the client side
                  return {
                    icon: getEmailIcon(email.subtitle!),
                    title: email.title,
                    selected: email.selected,
                    value: email.value,
                  }
                }) ?? []
              }
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
              selectedEmail={selectedEmail}
              connectedAccounts={connectedAccounts ?? []}
              selectedConnectedAccounts={selectedConnectedAccounts}
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
              selectAllAccountsCallback={setSelectedConnectedAccounts}
              cancelCallback={cancelCallback}
              authorizeCallback={authorizeCallback}
              disableAuthorize={
                // TODO: make generic!
                (requestedScope.includes('email') &&
                  (!connectedEmails?.length || !selectedEmail?.value)) ||
                (requestedScope.includes('connected_accounts') &&
                  !selectedConnectedAccounts?.length)
              }
              radius={appProfile.appTheme?.radius}
            />
          </div>
        </div>
      </div>
    </>
  )
}
