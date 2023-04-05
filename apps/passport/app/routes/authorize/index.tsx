import { json, redirect } from '@remix-run/cloudflare'
import type { LoaderFunction, ActionFunction } from '@remix-run/cloudflare'
import {
  useLoaderData,
  useOutletContext,
  useSubmit,
  useTransition,
} from '@remix-run/react'

import subtractLogo from '~/assets/subtract-logo.svg'

import { ResponseType } from '@proofzero/types/access'
import { getAccessClient, getStarbaseClient } from '~/platform.server'
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
import iIcon from '~/assets/i.svg'

import profileClassIcon from '~/components/authorization/profile-class-icon.svg'
import addressClassIcon from '~/components/authorization/address-class-icon.svg'
import emailClassIcon from '~/components/authorization/email-class-icon.svg'

import { getDataForScopes } from '~/utils/authorize.server'
import { useEffect, useState } from 'react'

import type { ScopeDescriptor } from '@proofzero/security/scopes'
import type { Profile } from '@proofzero/platform/account/src/types'
import type { AppPublicProps } from '@proofzero/platform/starbase/src/jsonrpc/validators/app'
import type { PersonaData } from '@proofzero/types/application'
import type { AddressURN } from '@proofzero/urns/address'
import type { DataForScopes } from '~/utils/authorize.server'
import { Text } from '@proofzero/design-system'
import { BadRequestError } from '@proofzero/errors'
import { throwJSONError } from '@proofzero/utils/errors'

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
}

export const loader: LoaderFunction = async ({ request, context }) => {
  const { clientId, redirectUri, scope, state } = context.consoleParams
  const { jwt, accountUrn } = await getValidatedSessionContext(
    request,
    context.consoleParams,
    context.env,
    context.traceSpan
  )

  const headers = new Headers()
  const lastCP = await getConsoleParams(request, context.env)
  if (lastCP) {
    headers.append(
      'Set-Cookie',
      await destroyConsoleParamsSession(request, context.env, lastCP.clientId)
    )

    headers.append(
      'Set-Cookie',
      await destroyConsoleParamsSession(request, context.env)
    )
  }

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

  //Scope validation
  try {
    const sbClient = getStarbaseClient(jwt, context.env, context.traceSpan)

    const [scopeMeta, appPublicProps] = await Promise.all([
      sbClient.getScopes.query(),
      sbClient.getAppPublicProps.query({
        clientId: clientId as string,
      }),
    ])

    if (!appPublicProps.scopes || !appPublicProps.scopes.length)
      throw new BadRequestError({
        message: 'No allowed scope was configured for the app',
      })
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

    if (
      scope.every(
        (scopeValue) =>
          scopeMeta.scopes[scopeValue] && scopeMeta.scopes[scopeValue].hidden
      )
    ) {
      //Pre-authorize if requested scope values are hidden (ie. system) scope values
      const responseType = ResponseType.Code
      const accessClient = getAccessClient(context.env, context.traceSpan)
      const authorizeRes = await accessClient.authorize.mutate({
        account: accountUrn,
        responseType,
        clientId,
        redirectUri,
        scope: scope,
        state,
      })

      const redirectParams = new URLSearchParams({
        code: authorizeRes.code,
        state: authorizeRes.state,
      })

      return redirect(`${redirectUri}?${redirectParams}`, {
        headers,
      })
    }

    const dataForScopes = await getDataForScopes(
      scope,
      accountUrn,
      jwt,
      context.env,
      context.traceSpan
    )

    return json<LoaderData>({
      redirectUri,
      clientId,
      appProfile: appPublicProps,
      scopeMeta: scopeMeta,
      state,
      redirectOverride: redirectUri,
      scopeOverride: scope || [],
      dataForScopes,
    })
  } catch (e) {
    console.error(e)
    throwJSONError(e)
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

const scopeIcons: Record<string, string> = {
  address: addressClassIcon,
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
  } = useLoaderData<LoaderData>()

  const { connectedEmails, personaData, requestedScope } = dataForScopes

  const { profile: userProfile } = useOutletContext<{
    profile: Required<Profile>
  }>()

  const [persona, setPersona] = useState<PersonaData>(personaData)

  // Re-render the component every time persona gets updated
  useEffect(() => {}, [persona])

  const submit = useSubmit()
  const transition = useTransition()

  const cancelCallback = () => {
    submit(
      {
        cancel: `${redirectUri}?=error=access_denied&state=${state}`,
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
    form.append('personaData', JSON.stringify(persona))

    submit(form, { method: 'post' })
  }

  return (
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
      <div className={'flex flex-col gap-4 items-start justify-start w-full'}>
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
                      {scope !== 'email' ? scopeMeta.scopes[scope].name : null}
                      {scope === 'email' ? (
                        <div className="w-full">
                          <EmailSelect
                            items={connectedEmails}
                            onSelect={(emailAddressURN: AddressURN) => {
                              setPersona({ ...persona, email: emailAddressURN })
                            }}
                          />
                        </div>
                      ) : null}
                    </div>

                    <img
                      src={iIcon}
                      alt={`${scopeMeta.scopes[scope].name} info`}
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
                requestedScope.includes('email') &&
                (!connectedEmails?.length || !persona?.email?.length)
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
  )
}
