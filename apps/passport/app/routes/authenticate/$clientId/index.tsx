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
import { useEffect, useRef, useState } from 'react'
import { HiOutlineMail } from 'react-icons/hi'
import { Authentication, ConnectButton } from '~/components'
import ConnectOAuthButton from '~/components/connect-oauth-button'
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

  const displayDict: { [key: string]: boolean } = {
    wallet: true,
    email: true,
    google: true,
    microsoft: true,
    apple: true,
    twitter: true,
    discord: true,
    github: true,
  }

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
    const hints = new Set(loginHint.split(' '))
    for (const key of Object.keys(displayDict)) {
      if (!hints.has(key)) {
        displayDict[key] = false
      }
    }
  }

  return json(
    {
      clientId: params.clientId,
      displayDict,
      loginHint,
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
  const oAuthWrapperRef = useRef<HTMLDivElement>(null)
  const [oAuthWrapperWidth, setOAuthWrapperWidth] = useState<
    number | undefined
  >()
  
  const { appProps, rollup_action } = useOutletContext<{
    appProps?: {
      name: string
      iconURL: string
      termsURL?: string
      privacyURL?: string
    }
    rollup_action?: string
  }>()

  const { clientId, displayDict, loginHint } = useLoaderData()

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

  useEffect(() => {
    setOAuthWrapperWidth(oAuthWrapperRef.current?.offsetWidth)
  }, [oAuthWrapperRef])

  return (
    // Maybe suspense here?
    <WagmiConfig client={client}>
      {transition.state !== 'idle' && <Loader />}

      <Authentication
        logoURL={iconURL}
        appName={name}
        generic={Boolean(rollup_action)}
      >
        <>
          {displayDict.wallet && (
            <ConnectButton
              signData={signData}
              isLoading={loading}
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
          )}

          {displayDict.email && (
            <AuthButton
              onClick={() => navigate(`/authenticate/${clientId}/email`)}
              Graphic={<HiOutlineMail className="w-full h-full" />}
              text={'Connect with Email'}
            />
          )}

          <div
            className="flex flex-row space-x-3 justify-evenly w-full"
            ref={oAuthWrapperRef}
          >
            {displayDict.google && (
              <Form
                className="w-full"
                action={`/connect/google${
                  rollup_action === 'reconnect' ? '?prompt=consent' : ''
                }`}
                method="post"
              >
                <ConnectOAuthButton provider="google" />
              </Form>
            )}

            {displayDict.microsoft && (
              <Form
                className="w-full"
                action={`/connect/microsoft${
                  rollup_action === 'reconnect' ? '?prompt=consent' : ''
                }`}
                method="post"
              >
                <ConnectOAuthButton
                  provider="microsoft"
                  parentWidth={oAuthWrapperWidth}
                />
              </Form>
            )}

            {displayDict.apple && (
              <Form className="w-full" action={`/connect/apple`} method="post">
                <ConnectOAuthButton
                  provider="apple"
                  parentWidth={oAuthWrapperWidth}
                />
              </Form>
            )}
          </div>

          <div className="flex flex-row space-x-3 justify-evenly w-full">
            {displayDict.twitter && (
              <Form
                className="w-full"
                action={`/connect/twitter`}
                method="post"
              >
                <ConnectOAuthButton
                  provider="twitter"
                  parentWidth={oAuthWrapperWidth}
                />
              </Form>
            )}

            {displayDict.discord && (
              <Form
                className="w-full"
                action={`/connect/discord${
                  rollup_action === 'reconnect' ? '?prompt=consent' : ''
                }`}
                method="post"
              >
                <ConnectOAuthButton
                  provider="discord"
                  parentWidth={oAuthWrapperWidth}
                />
              </Form>
            )}

            {displayDict.github && (
              <Form
                className="w-full"
                action={`/connect/github${
                  rollup_action === 'reconnect' ? '?prompt=consent' : ''
                }`}
                method="post"
              >
                <ConnectOAuthButton provider="github" />
              </Form>
            )}
          </div>

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
        </>
      </Authentication>
    </WagmiConfig>
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
