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
import { redirect, json } from '@remix-run/cloudflare'

import { getAuthzCookieParams } from '~/session.server'
import type { ActionFunction, LoaderFunction } from '@remix-run/cloudflare'
import { createClient } from 'wagmi'
import { getDefaultClient } from 'connectkit'
import Authentication, {
  AppProfile,
  AuthenticationScreenDefaults,
} from '@proofzero/design-system/src/templates/authentication/Authentication'

import { Text } from '@proofzero/design-system/src/atoms/text/Text'
import { Avatar } from '@proofzero/packages/design-system/src/atoms/profile/avatar/Avatar'
import { Button } from '@proofzero/packages/design-system/src/atoms/buttons/Button'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, params }) => {
    const url = new URL(request.url)

    let displayKeys = AuthenticationScreenDefaults.knownKeys

    let loginHint = url.searchParams.get('login_hint')

    if (loginHint) {
      const hints = loginHint
        .split(' ')
        .filter((val, i, arr) => arr.indexOf(val) === i)

      displayKeys = hints
    }

    return json({
      clientId: params.clientId,
      displayKeys,
      authnQueryParams: new URL(request.url).searchParams.toString(),
    })
  }
)

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context, params }) => {
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
)

export default () => {
  const { appProps, rollup_action } = useOutletContext<{
    appProps?: AppProfile
    rollup_action?: string
  }>()

  const { clientId, displayKeys, authnQueryParams } = useLoaderData()

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

    const error = url.searchParams.get('oauth_error')
    if (error) {
      const message = getOAuthErrorMessage(error)
      toast(ToastType.Error, { message }, { duration: 2000 })
      url.searchParams.delete('oauth_error')
    }

    history.replaceState(null, '', url.toString())
  })

  const generic = Boolean(rollup_action)

  const config = createConfig(
    getDefaultConfig({
      appName: 'Rollup',
      autoConnect: true,
      walletConnectProjectId:
        // @ts-ignore
        typeof window !== 'undefined' && window.ENV.WALLET_CONNECT_PROJECT_ID,
      alchemyId:
        // @ts-ignore
        typeof window !== 'undefined' && window.ENV.APIKEY_ALCHEMY_PUBLIC,
    })
  )

  return (
    <>
      {transition.state !== 'idle' && <Loader />}

      <Authentication
        logoURL={iconURL}
        appProfile={appProps}
        Header={
          <>
            {generic && (
              <>
                <Text
                  size="xl"
                  weight="semibold"
                  className="text-[#2D333A] mt-6 mb-8"
                >
                  Connect Account
                </Text>
              </>
            )}

            {!generic && (
              <>
                <Avatar
                  src={iconURL ?? AuthenticationScreenDefaults.defaultLogoURL}
                  size="sm"
                ></Avatar>
                <div className={'flex flex-col items-center gap-2'}>
                  <h1 className={'font-semibold text-xl'}>
                    {appProps?.name
                      ? `Login to ${appProps?.name}`
                      : AuthenticationScreenDefaults.defaultHeading}
                  </h1>
                  <h2
                    style={{ color: '#6B7280' }}
                    className={'font-medium text-base'}
                  >
                    {AuthenticationScreenDefaults.defaultSubheading}
                  </h2>
                </div>
              </>
            )}
          </>
        }
        Actions={
          generic ? (
            <>
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
            </>
          ) : undefined
        }
        displayKeys={displayKeys}
        mapperArgs={{
          clientId,
          wagmiClient: client,
          signData,
          navigate,
          FormWrapperEl: ({ children, provider }) => (
            <Form
              className="w-full"
              action={`/connect/${provider}?${authnQueryParams}`}
              method="post"
              key={provider}
            >
              {children}
            </Form>
          ),
          enableOAuthSubmit: true,
          loading,
          walletConnectCallback: async (address) => {
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
              .catch(() => {
                toast(ToastType.Error, {
                  message:
                    'Could not fetch nonce for signing authentication message',
                })
              })
          },
          walletSignCallback: (address, signature, nonce, state) => {
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
          },
          walletConnectErrorCallback: (error) => {
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
          },
        }}
      />
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
