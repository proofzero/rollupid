import {
  Form,
  useOutletContext,
  useSubmit,
  useTransition,
} from '@remix-run/react'
import { useEffect, useState } from 'react'
import { Authentication, ConnectButton } from '~/components'
import ConnectOAuthButton from '~/components/connect-oauth-button'
import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import { Loader } from '@kubelt/design-system/src/molecules/loader/Loader'
import { toast, ToastType } from '@kubelt/design-system/src/atoms/toast'
import { Profile } from '@kubelt/platform/account/src/types'
import { HiCheck } from 'react-icons/hi'
import { Button } from '@kubelt/design-system/src/atoms/buttons/Button'

export default function Authenticate() {
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
  const context = useOutletContext<{
    appProps?: {
      name: string
      iconURL: string
    }
    profile?: Required<Profile>
  }>()

  const name = context.appProps?.name
  const iconURL = context.appProps?.iconURL

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
          {context.profile && (
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
              >
                <div className="flex flex-row items-center space-x-3">
                  <img
                    className="w-6 h-6 rounded-full"
                    src={context.profile.pfp.image}
                  />
                  <Text weight="medium" className="text-gray-800">
                    {context.profile.displayName}
                  </Text>

                  <HiCheck className="w-3.5 h-3.5 text-indigo-500" />
                </div>
              </Button>
              <div className="my-5 flex flex-row items-center space-x-3">
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

          {!context.profile && (
            <div className="my-5 flex flex-row items-center space-x-3">
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
