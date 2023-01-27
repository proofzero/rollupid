import { useState } from 'react'
import { Authentication } from '~/components'

export default function Authenticate() {
  const [enableWalletConnect, setEnableWalletConnect] = useState(true)

  return (
    <Authentication
      enableWalletConnect={enableWalletConnect}
      connectCallback={async (address) => {
        window.location.href = `/authenticate/${address}/sign`
      }}
      connectErrorCallback={(error) => {
        console.error(error)
        alert('Error connecting to wallet')
        setEnableWalletConnect(false)
      }}
    />
  )
}
