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
import ConnectOAuthButton from '~/components/connect-oauth-button'
import {
  ActionFunction,
  redirect,
  json,
  LoaderFunction,
} from '@remix-run/cloudflare'

import AuthButton from '~/components/connect-button/AuthButton'
import { getConsoleParams } from '~/session.server'

export const loader: LoaderFunction = async ({ request, params }) => {
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

  const loginHint = url.searchParams.get('login_hint')
  if (loginHint) {
    const hints = new Set(loginHint.split(','))
    for (const key of Object.keys(displayDict)) {
      if (!hints.has(key)) {
        displayDict[key] = false
      }
    }
  }

  return json({
    clientId: params.clientId,
    displayDict,
  })
}

export const action: ActionFunction = async ({ request, context, params }) => {
  const consoleParams = await getConsoleParams(
    request,
    context.env,
    params.clientId
  )

  const { redirectUri, state, scope, clientId } = consoleParams

  const qp = new URLSearchParams()
  qp.append('client_id', clientId)
  qp.append('redirect_uri', redirectUri)
  qp.append('state', state)
  qp.append('scope', scope.join(' '))

  return redirect(`/authorize?${qp.toString()}`)
}

export default () => {
  const { appProps } = useOutletContext<{
    appProps?: {
      name: string
      iconURL: string
    }
  }>()

  const { clientId, displayDict } = useLoaderData()

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

  return (
    <>
      {transition.state !== 'idle' && <Loader />}

      <Authentication logoURL={iconURL} appName={name}>
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

          <div className="flex flex-row space-x-3 justify-evenly w-full">
            {displayDict.google && (
              <Form className="w-full" action={`/connect/google`} method="post">
                <ConnectOAuthButton provider="google" />
              </Form>
            )}

            {displayDict.microsoft && (
              <Form
                className="w-full"
                action={`/connect/microsoft`}
                method="post"
              >
                <ConnectOAuthButton provider="microsoft" />
              </Form>
            )}

            {displayDict.apple && (
              <Form className="w-full" action={`/connect/apple`} method="post">
                <ConnectOAuthButton provider="apple" />
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
                <ConnectOAuthButton provider="twitter" />
              </Form>
            )}

            {displayDict.discord && (
              <Form
                className="w-full"
                action={`/connect/discord`}
                method="post"
              >
                <ConnectOAuthButton provider="discord" />
              </Form>
            )}

            {displayDict.github && (
              <Form className="w-full" action={`/connect/github`} method="post">
                <ConnectOAuthButton provider="github" />
              </Form>
            )}
          </div>
        </>
      </Authentication>
    </>
  )
}
