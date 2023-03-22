import { Button } from '@proofzero/design-system'
import { toast, ToastType } from '@proofzero/design-system/src/atoms/toast'
import { Loader } from '@proofzero/design-system/src/molecules/loader/Loader'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'
import { Profile } from '@proofzero/platform/account/src/types'
import {
  Form,
  useLoaderData,
  useNavigate,
  useOutletContext,
  useSubmit,
  useTransition,
} from '@remix-run/react'
import { useEffect, useState } from 'react'
import { HiCheck, HiOutlineMail } from 'react-icons/hi'
import { Authentication, ConnectButton } from '~/components'
import ConnectOAuthButton from '~/components/connect-oauth-button'
import { ResponseType } from '@proofzero/types/access'
import { AccountURN } from '@proofzero/urns/account'
import {
  ActionFunction,
  redirect,
  json,
  LoaderFunction,
} from '@remix-run/cloudflare'
import { getAccessClient } from '~/platform.server'
import {
  getConsoleParamsSession,
  requireJWT,
  parseJwt,
  destroyConsoleParamsSession,
} from '~/session.server'

export const loader: LoaderFunction = async ({ params }) => {
  return json({
    clientId: params.clientId,
  })
}

export const action: ActionFunction = async ({ request, context, params }) => {
  let consoleParams
  if (params.clientId !== 'console') {
    consoleParams = await getConsoleParamsSession(
      request,
      context.env,
      params.clientId!
    )
      .then((session) => JSON.parse(session.get('params')))
      .catch((err) => {
        console.log('No console params session found')
        return null
      })
  }

  // TODO: Make decision based on clientId params (console?)
  if (!consoleParams) return redirect(context.env.CONSOLE_APP_URL)

  const { redirectUri, state, clientId } = consoleParams

  const jwt = await requireJWT(request, consoleParams, context.env)
  const parsedJWT = parseJwt(jwt)
  const account = parsedJWT.sub as AccountURN
  const responseType = ResponseType.Code
  const accessClient = getAccessClient(context.env, context.traceSpan)
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

  const headers = new Headers()
  headers.append(
    'Set-Cookie',
    await destroyConsoleParamsSession(request, context.env)
  )

  return redirect(`${redirectUri}?${redirectParams}`, {
    headers,
  })
}

export default () => {
  const { prompt, appProps, profile } = useOutletContext<{
    prompt?: string
    appProps?: {
      name: string
      iconURL: string
    }
    profile?: Required<Profile>
  }>()

  const { clientId } = useLoaderData()

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

  useEffect(() => {
    if (transition.state === 'idle') {
      setLoading(false)
    }
  }, [transition.state])

  return (
    <>
      {transition.state !== 'idle' && <Loader />}

      <Authentication logoURL={iconURL} appName={name}>
        <>
          {profile && prompt !== 'login' && (
            <>
              <Button
                btnType="secondary-alt"
                style={{
                  height: 50,
                  width: '100%',
                  fontSize: 16,
                  fontWeight: 500,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onClick={() => {
                  submit(
                    {},
                    {
                      method: 'post',
                    }
                  )
                }}
              >
                <div className="flex flex-row items-center space-x-3">
                  {profile.pfp?.image && (
                    <img
                      className="w-6 h-6 rounded-full"
                      src={profile.pfp.image}
                    />
                  )}
                  <Text weight="medium" className="text-gray-800">
                    {profile.displayName}
                  </Text>

                  <HiCheck className="w-3.5 h-3.5 text-indigo-500" />
                </div>
              </Button>
              <div className="my-1 flex flex-row items-center space-x-3">
                <hr className="h-px w-16 bg-gray-500" />
                <Text>or</Text>
                <hr className="h-px w-16 bg-gray-500" />
              </div>
            </>
          )}

          <ConnectButton
            signData={signData}
            isLoading={loading}
            connectCallback={async (address) => {
              if (loading) return
              // fetch nonce and kickoff sign flow
              setLoading(true)
              fetch(`/connect/${address}/sign`) // NOTE: note using fetch because it messes with wagmi state
                .then((res) =>
                  res.json<{ nonce: string; state: string; address: string }>()
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

          {!profile && (
            <div className="my-2 flex flex-row items-center space-x-3">
              <hr className="h-px w-16 bg-gray-500" />
              <Text>or</Text>
              <hr className="h-px w-16 bg-gray-500" />
            </div>
          )}

          <div className="flex flex-row space-x-3 justify-evenly w-full">
            <Form className="w-full" action={`/connect/google`} method="post">
              <ConnectOAuthButton provider="google" />
            </Form>

            <Form
              className="w-full"
              action={`/connect/microsoft`}
              method="post"
            >
              <ConnectOAuthButton provider="microsoft" />
            </Form>

            <Form className="w-full" action={`/connect/apple`} method="post">
              <ConnectOAuthButton provider="apple" />
            </Form>
          </div>

          <div className="flex flex-row space-x-3 justify-evenly w-full">
            <Form className="w-full" action={`/connect/twitter`} method="post">
              <ConnectOAuthButton provider="twitter" />
            </Form>

            <Form className="w-full" action={`/connect/discord`} method="post">
              <ConnectOAuthButton provider="discord" />
            </Form>

            <Form className="w-full" action={`/connect/github`} method="post">
              <ConnectOAuthButton provider="github" />
            </Form>
          </div>
        </>
      </Authentication>
    </>
  )
}
