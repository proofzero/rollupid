import { useSubmit } from '@remix-run/react'
import { useState } from 'react'
import { Authentication } from '~/components'

export default function Authenticate() {
  const [enableWalletConnect, setEnableWalletConnect] = useState(true)
  const submit = useSubmit()
  return (
    <Authentication
      enableWalletConnect={enableWalletConnect}
      connectCallback={async (address) => {
        submit(null, {
          method: 'get',
          action: `/authenticate/sign/${address}${window.location.search}`,
        })
      }}
      connectErrorCallback={(error) => {
        console.error(error)
        alert('Error connecting to wallet')
        setEnableWalletConnect(false)
      }}
    />
  )
}
