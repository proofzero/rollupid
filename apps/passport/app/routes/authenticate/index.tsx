import { Form, useOutletContext, useTransition } from '@remix-run/react'
import { useState } from 'react'
import { Authentication, ConnectButton } from '~/components'
import ConnectOAuthButton from '~/components/connect-oauth-button'
import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import { Loader } from '@kubelt/design-system/src/molecules/loader/Loader'

export default function Authenticate() {
  const [enableWalletConnect, setEnableWalletConnect] = useState(true)

  const context = useOutletContext<{
    appProps?: {
      name: string
      iconURL: string
    }
  }>()

  const name = context.appProps?.name
  const iconURL = context.appProps?.iconURL

  const transition = useTransition()

  return (
    <>
      {transition.state !== 'idle' && <Loader />}

      <Authentication logoURL={iconURL} appName={name}>
        <>
          <ConnectButton
            disabled={!enableWalletConnect}
            connectCallback={async (address) => {
              window.location.href = `/connect/${address}/sign`
            }}
            connectErrorCallback={(error) => {
              console.error(error)
              alert('Error connecting to wallet')
              setEnableWalletConnect(false)
            }}
          />
          <div className="my-5 flex flex-row items-center space-x-3">
            <hr className="h-px w-16 bg-gray-500" />
            <Text>or</Text>
            <hr className="h-px w-16 bg-gray-500" />
          </div>

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
