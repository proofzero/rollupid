import { toast, ToastType } from '@proofzero/design-system/src/atoms/toast'
import { Loader } from '@proofzero/design-system/src/molecules/loader/Loader'
import {
  Form,
  useLoaderData,
  useNavigate,
  useOutletContext,
  useSubmit,
  useTransition,
} from '@remix-run/react'
import { useEffect, useState } from 'react'
import { HiOutlineMail } from 'react-icons/hi'
import { Authentication, ConnectButton } from '~/components'
import ConnectOAuthButton, {
  OAuthProvider,
} from '~/components/connect-oauth-button'
import { redirect, json } from '@remix-run/cloudflare'

import { AuthButton } from '@proofzero/design-system/src/molecules/auth-button/AuthButton'
import {
  commitAuthenticationParamsSession,
  getAuthzCookieParams,
  getAuthenticationParamsSession,
} from '~/session.server'
import type { ActionFunction, LoaderFunction } from '@remix-run/cloudflare'
import { Button } from '@proofzero/design-system/src/atoms/buttons/Button'
import { createClient, WagmiConfig } from 'wagmi'
import { getDefaultClient } from 'connectkit'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'

const client = createClient(
  // @ts-ignore
  getDefaultClient({
    appName: 'Rollup',
    autoConnect: true,
    alchemyId:
      // @ts-ignore
      typeof window !== 'undefined' && window.ENV.APIKEY_ALCHEMY_PUBLIC,
  })
)

export const loader: LoaderFunction = async ({ request, params, context }) => {
  const url = new URL(request.url)

  let displayKeys = [
    'wallet',
    'email',
    'google',
    'microsoft',
    'apple',
    'twitter',
    'discord',
    'github',
  ]

  const authenticationParamsSession = await getAuthenticationParamsSession(
    request,
    context.env
  )

  let loginHint = url.searchParams.get('login_hint')
  if (loginHint) {
    authenticationParamsSession.set('login_hint', loginHint)
  } else {
    loginHint = authenticationParamsSession.get('login_hint')
  }

  if (loginHint) {
    const hints = loginHint
      .split(' ')
      .filter((val, i, arr) => arr.indexOf(val) === i)

    displayKeys = hints
  }

  return json(
    {
      clientId: params.clientId,
      displayKeys,
    },
    {
      headers: {
        'Set-Cookie': await commitAuthenticationParamsSession(
          context.env,
          authenticationParamsSession
        ),
      },
    }
  )
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
  const { appProps, rollup_action } = useOutletContext<{
    appProps?: {
      name: string
      iconURL: string
      termsURL?: string
      privacyURL?: string
    }
    rollup_action?: string
  }>()

  const { clientId, displayKeys, loginHint } = useLoaderData()

  const [signData, setSignData] = useState<{
    nonce: string | undefined
    state: string | undefined
    address: string | undefined
    signature: string | undefined
  }>({
    nonce: undefined,
    state: undefined,
    address: undefined,
    signature: undefined,
  })
  const [loading, setLoading] = useState(false)

  const name = appProps?.name
  const iconURL = appProps?.iconURL

  const transition = useTransition()
  const submit = useSubmit()

  const navigate = useNavigate()

  useEffect(() => {
    if (transition.state === 'idle') {
      setLoading(false)
    }
  }, [transition.state])

  useEffect(() => {
    const url = new URL(window.location.href)

    if (rollup_action) url.searchParams.set('rollup_action', rollup_action)
    if (loginHint) url.searchParams.set('login_hint', loginHint)

    const error = url.searchParams.get('oauth_error')
    if (error) {
      const message = getOAuthErrorMessage(error)
      toast(ToastType.Error, { message }, { duration: 2000 })
      url.searchParams.delete('oauth_error')
    }

    history.replaceState(null, '', url.toString())
  })

  const displayKeyMapper = (
    key: string,
    flex: boolean = false,
    displayContinueWith: boolean = false
  ) => {
    let el
    switch (key) {
      case 'wallet':
        el = (
          <WagmiConfig client={client}>
            <ConnectButton
              key={key}
              signData={signData}
              isLoading={loading}
              fullSize={flex}
              displayContinueWith={displayContinueWith}
              connectCallback={async (address) => {
                if (loading) return
                // fetch nonce and kickoff sign flow
                setLoading(true)
                fetch(`/connect/${address}/sign`) // NOTE: note using fetch because it messes with wagmi state
                  .then((res) =>
                    res.json<{
                      nonce: string
                      state: string
                      address: string
                    }>()
                  )
                  .then(({ nonce, state, address }) => {
                    setSignData({
                      nonce,
                      state,
                      address,
                      signature: undefined,
                    })
                  })
                  .catch((err) => {
                    toast(ToastType.Error, {
                      message:
                        'Could not fetch nonce for signing authentication message',
                    })
                  })
              }}
              signCallback={(address, signature, nonce, state) => {
                console.debug('signing complete')
                setSignData({
                  ...signData,
                  signature,
                })
                submit(
                  { signature, nonce, state },
                  {
                    method: 'post',
                    action: `/connect/${address}/sign`,
                  }
                )
              }}
              connectErrorCallback={(error) => {
                console.debug('transition.state: ', transition.state)
                if (transition.state !== 'idle' || !loading) {
                  return
                }
                if (error) {
                  console.error(error)
                  toast(ToastType.Error, {
                    message:
                      'Failed to complete signing. Please try again or contact support.',
                  })
                  setLoading(false)
                }
              }}
            />
          </WagmiConfig>
        )
        break
      case 'email':
        el = (
          <AuthButton
            key={key}
            onClick={() => navigate(`/authenticate/${clientId}/email`)}
            Graphic={<HiOutlineMail className="w-full h-full" />}
            text={'Email'}
            fullSize={flex}
            displayContinueWith={displayContinueWith}
          />
        )
        break
      default:
        el = (
          <Form
            className="w-full"
            action={`/connect/${key}${
              rollup_action === 'reconnect' ? '?prompt=consent' : ''
            }`}
            method="post"
            key={key}
          >
            <ConnectOAuthButton
              provider={key as OAuthProvider}
              fullSize={flex}
              displayContinueWith={displayContinueWith}
            />
          </Form>
        )
    }

    return (
      <div
        key={key}
        className={`w-full min-w-0 ${displayContinueWith ? 'relative' : ''}`}
      >
        {el}
      </div>
    )
  }

  const displayKeyDisplayFn = (displayKeys: string[]): JSX.Element[] => {
    const rows = []

    if (displayKeys.length === 1) {
      rows.push(displayKeyMapper(displayKeys[0], true))
    }

    if (displayKeys.length === 2) {
      rows.push(displayKeys.map((dk) => displayKeyMapper(dk, true)))
    }

    if (displayKeys.length === 3) {
      rows.push(displayKeys.map((dk) => displayKeyMapper(dk)))
    }

    if (displayKeys.length === 4) {
      rows.push(displayKeys.slice(0, 2).map((dk) => displayKeyMapper(dk, true)))
      rows.push(displayKeys.slice(2, 4).map((dk) => displayKeyMapper(dk, true)))
    }

    if (displayKeys.length === 5) {
      rows.push(displayKeys.slice(0, 2).map((dk) => displayKeyMapper(dk, true)))
      rows.push(displayKeys.slice(2, 5).map((dk) => displayKeyMapper(dk)))
    }

    if (displayKeys.length === 6) {
      rows.push(displayKeys.slice(0, 3).map((dk) => displayKeyMapper(dk)))
      rows.push(displayKeys.slice(3, 6).map((dk) => displayKeyMapper(dk)))
    }

    if (displayKeys.length > 6) {
      const firstHalf = displayKeys.slice(0, Math.ceil(displayKeys.length / 2))
      const secondHalf = displayKeys.slice(
        Math.ceil(displayKeys.length / 2),
        displayKeys.length
      )

      return [
        ...displayKeyDisplayFn(firstHalf),
        ...displayKeyDisplayFn(secondHalf),
      ]
    }

    return rows.map((row, i) => (
      <div
        key={`${displayKeys.join('_')}_${i}`}
        className="flex flex-row justify-evenly gap-4 relative"
      >
        {row}
      </div>
    ))
  }

  return (
    <>
      {transition.state !== 'idle' && <Loader />}

      <Authentication
        logoURL={iconURL}
        appName={name}
        generic={Boolean(rollup_action)}
      >
        <div className="flex-1 w-full flex flex-col gap-4 relative">
          {displayKeys
            .slice(0, 2)
            .map((dk: OAuthProvider) => displayKeyMapper(dk, true, true))}

          {displayKeys.length > 2 && (
            <>
              <div className="flex flex-row items-center">
                <div className="border-t border-gray-200 flex-1"></div>
                <Text className="px-3 text-gray-500" weight="medium">
                  or
                </Text>
                <div className="border-t border-gray-200 flex-1"></div>
              </div>

              {displayKeyDisplayFn(displayKeys.slice(2))}
            </>
          )}

          {(appProps?.termsURL || appProps?.privacyURL) && (
            <Text size="sm" className="text-gray-500 mt-7">
              Before using this app, you can review{' '}
              {appProps?.name ?? `Company`}
              's{' '}
              <a href={appProps.privacyURL} className="text-indigo-500">
                privacy policy
              </a>
              {appProps?.termsURL && appProps?.privacyURL && <span> and </span>}
              <a href={appProps.termsURL} className="text-indigo-500">
                terms of service
              </a>
              .
            </Text>
          )}

          {rollup_action && (
            <div className="flex flex-1 items-end">
              <Button
                btnSize="l"
                btnType="secondary-alt"
                className="w-full hover:bg-gray-100"
                onClick={() => navigate('/authenticate/cancel')}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </Authentication>
    </>
  )
}

const getOAuthErrorMessage = (error: string): string => {
  switch (error) {
    case 'invalid_request':
    case 'invalid_client':
    case 'invalid_grant':
    case 'unauthorized_client':
    case 'unsupported_response_type':
    case 'invalid_scope':
    case 'server_error':
      return 'An error was encountered with the provider configuration.'
    case 'access_denied':
    case 'temporarily_unavailable':
      return 'Something went wrong with the provider authorization. Please try again.'
    default:
      return 'An unknown error occurred'
  }
}
