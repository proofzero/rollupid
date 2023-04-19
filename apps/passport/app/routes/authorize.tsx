import { json, redirect } from '@remix-run/cloudflare'
import type { LoaderFunction, ActionFunction } from '@remix-run/cloudflare'
import {
  useLoaderData,
  useNavigate,
  useSubmit,
  useTransition,
} from '@remix-run/react'

import subtractLogo from '~/assets/subtract-logo.svg'

import { ResponseType } from '@proofzero/types/access'
import {
  getAccessClient,
  getAccountClient,
  getStarbaseClient,
} from '~/platform.server'
import {
  destroyConsoleParamsSession,
  getConsoleParams,
  getValidatedSessionContext,
} from '~/session.server'
import { validatePersonaData } from '@proofzero/security/persona'
import { Button } from '@proofzero/design-system/src/atoms/buttons/Button'
import { Avatar } from '@proofzero/design-system/src/atoms/profile/avatar/Avatar'
import { Spinner } from '@proofzero/design-system/src/atoms/spinner/Spinner'
import { EmailSelect } from '@proofzero/design-system/src/atoms/email/EmailSelect'

import authorizeCheck from '~/assets/authorize-check.svg'
import Info from '~/components/authorization/Info'

import profileClassIcon from '~/components/authorization/profile-class-icon.svg'
import addressClassIcon from '~/components/authorization/address-class-icon.svg'
import emailClassIcon from '~/components/authorization/email-class-icon.svg'

import {
  authzParamsMatch,
  createAuthzParamCookieAndAuthenticate,
  getDataForScopes,
} from '~/utils/authorize.server'
import { useEffect, useState } from 'react'
import { OptionType } from '@proofzero/utils/getNormalisedConnectedEmails'
import { ToastType, toast } from '@proofzero/design-system/src/atoms/toast'
import { Text } from '@proofzero/design-system'
import { BadRequestError, InternalServerError } from '@proofzero/errors'
import { JsonError } from '@proofzero/utils/errors'

import sideGraphics from '~/assets/auth-side-graphics.svg'

import type { ScopeDescriptor } from '@proofzero/security/scopes'
import type { AppPublicProps } from '@proofzero/platform/starbase/src/jsonrpc/validators/app'
import type { PersonaData } from '@proofzero/types/application'
import type { DataForScopes } from '~/utils/authorize.server'
import type { EmailSelectListItem } from '@proofzero/utils/getNormalisedConnectedEmails'
import type { GetProfileOutputParams } from '@proofzero/platform/account/src/jsonrpc/methods/getProfile'
import useConnectResult from '~/hooks/useConnectResult'

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
}

export const loader: LoaderFunction = async ({ request, context }) => {
  const { clientId, redirectUri, state, prompt } = context.consoleParams

  const connectResult =
    new URL(request.url).searchParams.get('connect_result') ?? undefined

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

  if (prompt && !['consent', 'connect'].includes(prompt))
    throw new BadRequestError({ message: 'only prompt supported is "consent"' })

  const lastCP = await getConsoleParams(request, context.env)

  //If no authorization cookie and we're not logging into
  //Passport Settings, then we create authz cookie & authenticate
  if (
    !lastCP &&
    !(
      context.consoleParams.clientId === 'passport' &&
      context.consoleParams.redirectUri ===
        `${new URL(request.url).origin}/settings`
    ) &&
    connectResult !== 'CANCEL'
  ) {
    await createAuthzParamCookieAndAuthenticate(
      request,
      context.consoleParams,
      context.env
    )
  }

  const headers = new Headers()
  if (lastCP) {
    if (!authzParamsMatch(lastCP, context.consoleParams)) {
      await createAuthzParamCookieAndAuthenticate(
        request,
        context.consoleParams,
        context.env
      )
    }

    headers.append(
      'Set-Cookie',
      await destroyConsoleParamsSession(request, context.env, lastCP.clientId)
    )

    headers.append(
      'Set-Cookie',
      await destroyConsoleParamsSession(request, context.env)
    )
  }

  const { jwt, accountUrn } = await getValidatedSessionContext(
    request,
    context.consoleParams,
    context.env,
    context.traceSpan
  )

  //Special case for console and passport - we just redirect
  if (['console', 'passport'].includes(clientId)) {
    const redirectURL = new URL(redirectUri)
    if (connectResult) {
      redirectURL.searchParams.set('connect_result', connectResult)
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
    const scope = [...new Set(context.consoleParams.scope)]

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
        context.consoleParams.prompt &&
        context.consoleParams.prompt === 'consent'
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

const scopeIcons: Record<string, string> = {
  connected_addresses: addressClassIcon,
  profile: profileClassIcon,
  email: emailClassIcon,
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
  } = useLoaderData<LoaderData>()

  const userProfile = profile as UserProfile

  const { connectedEmails, personaData, requestedScope, connectedAddresses } =
    dataForScopes

  const [persona] = useState<PersonaData>(personaData)
  const [selectedEmail, setSelectedEmail] = useState<EmailSelectListItem>()

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
    // TODO: Everything should be a form field now handled by javascript
    // This helps keeps things generic has if a form input is not present
    // it doesn't end up being submitted

    let personaData = {}
    if (scopes.includes('email'))
      personaData = { ...personaData, email: selectedEmail?.addressURN }
    if (scopes.includes('connected_addresses'))
      personaData = { ...personaData, connected_addresses: connectedAddresses }

    form.append('personaData', JSON.stringify(personaData))
    submit(form, { method: 'post' })
  }

  return (
    <div className={'flex flex-row h-screen justify-center items-center'}>
      <div
        className={
          'basis-2/5 h-screen w-full hidden lg:flex justify-center items-center bg-indigo-50 overflow-hidden'
        }
      >
        <img src={sideGraphics} alt="Background graphics" />
      </div>
      <div className={'basis-full basis-full lg:basis-3/5'}>
        <div
          className={'flex flex-col gap-4 basis-96 m-auto bg-white p-6'}
          style={{
            width: 418,
            height: 598,
            border: '1px solid #D1D5DB',
            boxSizing: 'border-box',
            borderRadius: 8,
          }}
        >
          <div className={'flex flex-row items-center justify-center'}>
            <Avatar
              src={userProfile.pfp?.image as string}
              hex={false}
              size={'sm'}
              // alt="User Profile"
            />
            <img src={authorizeCheck} alt="Authorize Check" />
            <Avatar src={appProfile.iconURL} size={'sm'} />
          </div>
          <div className={'flex flex-col items-center justify-center gap-2'}>
            <h1 className={'font-semibold text-xl'}>{appProfile.name}</h1>
            <p style={{ color: '#6B7280' }} className={'font-light text-base'}>
              would like access to the following information
            </p>
          </div>
          <div
            className={'flex flex-col gap-4 items-start justify-start w-full'}
          >
            <div className={'items-start justify-start w-full'}>
              <p
                style={{ color: '#6B7280' }}
                className={'mb-2 font-extralight text-xs'}
              >
                REQUESTED
              </p>
              <ul
                style={{ color: '#6B7280' }}
                className={'flex flex-col font-light text-base gap-2 w-full'}
              >
                {requestedScope
                  .filter((scope: string) => {
                    if (scopeMeta.scopes[scope])
                      return !scopeMeta.scopes[scope].hidden
                    // If we do not have scope from url in our lookup table -
                    // we can't show it
                    return false
                  })
                  .map((scope: string, i: number) => {
                    return (
                      <li
                        key={i}
                        className={
                          'flex flex-row gap-2 items-center justify-between w-full'
                        }
                      >
                        <div className="flex flex-row w-full gap-2 items-center">
                          <img src={scopeIcons[scope]} alt={`${scope} Icon`} />
                          {scope !== 'email'
                            ? scopeMeta.scopes[scope].name
                            : null}
                          {scope === 'email' ? (
                            <div className="w-full">
                              <EmailSelect
                                items={connectedEmails}
                                enableAddNew={true}
                                onSelect={(selected: EmailSelectListItem) => {
                                  if (selected?.type === OptionType.AddNew) {
                                    const qp = new URLSearchParams()
                                    qp.append('scope', requestedScope.join(' '))
                                    qp.append('state', state)
                                    qp.append('client_id', clientId)
                                    qp.append('redirect_uri', redirectOverride)
                                    qp.append('prompt', 'connect')
                                    qp.append(
                                      'login_hint',
                                      'email microsoft google apple'
                                    )

                                    return navigate(
                                      `/authorize?${qp.toString()}`
                                    )
                                  }

                                  setSelectedEmail(selected)
                                }}
                              />
                            </div>
                          ) : null}
                        </div>

                        <Info
                          name={scopeMeta.scopes[scope].name}
                          description={scopeMeta.scopes[scope].description}
                        />

                        <div
                          data-popover
                          id={`popover-${scope}`}
                          role="tooltip"
                          className="absolute z-10 invisible inline-block
                    font-[Inter]
                     min-w-64 text-sm font-light text-gray-500 transition-opacity duration-300 bg-white border border-gray-200 rounded-lg shadow-sm opacity-0 dark:text-gray-400 dark:border-gray-600 dark:bg-gray-800"
                        >
                          <div className="px-3 py-2 bg-gray-100 border-b border-gray-200 rounded-t-lg dark:border-gray-600 dark:bg-gray-700">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {scope}
                            </h3>
                          </div>
                          <div className="px-3 py-2">
                            <p>{scopeMeta.scopes[scope].description}</p>
                          </div>
                          <div data-popper-arrow></div>
                        </div>
                      </li>
                    )
                  })}
              </ul>
            </div>
          </div>
          <div
            className={
              'flex flex-row w-full items-end justify-center gap-4 mt-auto'
            }
          >
            {transition.state === 'idle' && (
              <>
                <Button
                  btnSize="xl"
                  btnType="secondary-alt"
                  onClick={() => {
                    cancelCallback()
                  }}
                >
                  Cancel
                </Button>
                <Button
                  btnSize="xl"
                  btnType="primary-alt"
                  disabled={
                    // TODO: make generic!
                    requestedScope.includes('email') &&
                    (!connectedEmails?.length || !selectedEmail)
                  }
                  onClick={() => {
                    authorizeCallback(requestedScope)
                  }}
                >
                  Continue
                </Button>
              </>
            )}
            {transition.state !== 'idle' && <Spinner />}
          </div>
          <div className="mt-7 flex justify-center items-center space-x-2">
            <img src={subtractLogo} alt="powered by rollup.id" />
            <Text size="xs" weight="normal" className="text-gray-400">
              Powered by{' '}
              <a href="https://rollup.id" className="hover:underline">
                rollup.id
              </a>
            </Text>
          </div>
        </div>
      </div>
    </div>
  )
}
