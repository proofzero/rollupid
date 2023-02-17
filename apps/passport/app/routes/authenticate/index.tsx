import { useOutletContext } from '@remix-run/react'
import { useState } from 'react'
import { Authentication } from '~/components'

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

  return (
    <Authentication
      logoURL={iconURL}
      appName={name}
      enableWalletConnect={enableWalletConnect}
      connectCallback={async (address) => {
        window.location.href = `/connect/${address}/sign`
      }}
      connectErrorCallback={(error) => {
        console.error(error)
        alert('Error connecting to wallet')
        setEnableWalletConnect(false)
      }}
    />
  )
}
