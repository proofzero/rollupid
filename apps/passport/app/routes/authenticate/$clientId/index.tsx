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
import {
  ActionFunction,
  redirect,
  json,
  LoaderFunction,
} from '@remix-run/cloudflare'

import AuthButton from '~/components/connect-button/AuthButton'
import { getConsoleParams, getUserSession } from '~/session.server'

export const loader: LoaderFunction = async ({ request, context, params }) => {
  const userSession = await getUserSession(
    request,
    context.env,
    params.clientId
  )
  const showContinueWithExistingUser = userSession ? true : false

  return json({
    clientId: params.clientId,
    showContinueWithExistingUser,
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
  qp.append('scope', scope)

  return redirect(`/authorize?${qp.toString()}`)
}

export default () => {
  const { appProps, profile } = useOutletContext<{
    appProps?: {
      name: string
      iconURL: string
    }
    profile?: Required<Profile>
  }>()

  const { clientId, showContinueWithExistingUser } = useLoaderData()

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
          {profile && showContinueWithExistingUser && (
            <>
              <AuthButton
                onClick={() => {
                  submit(
                    {},
                    {
                      method: 'post',
                    }
                  )
                }}
                Graphic={
                  <>
                    {profile.pfp?.image && (
                      <img
                        className="w-6 h-6 rounded-full"
                        src={profile.pfp.image}
                        alt="PFP"
                      />
                    )}
                  </>
                }
                text={profile.displayName}
                Addon={<HiCheck className="w-3.5 h-3.5 text-indigo-500" />}
              />

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

          <AuthButton
            onClick={() => navigate(`/authenticate/${clientId}/email`)}
            Graphic={<HiOutlineMail className="w-full h-full" />}
            text={'Connect with Email'}
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
