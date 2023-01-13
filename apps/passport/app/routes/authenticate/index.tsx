import { LoaderFunction } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import { useState } from 'react'
import { Authentication } from '~/components'

export const loader: LoaderFunction = async ({ request, context }) => {
  const searchParams = new URL(request.url).searchParams
  const oauthEnabled: boolean = searchParams.get('enableOAuth') !== null
  return { oauthEnabled }
}

export default function Authenticate() {
  const [enableWalletConnect, setEnableWalletConnect] = useState(true)
  const { oauthEnabled } = useLoaderData()
  return (
    <Authentication
      enableWalletConnect={enableWalletConnect}
      enableOAuthConnect={oauthEnabled}
      connectCallback={async (address) => {
        window.location.href = `/authenticate/${address}/sign${window.location.search}`
      }}
      connectErrorCallback={(error) => {
        console.error(error)
        alert('Error connecting to wallet')
        setEnableWalletConnect(false)
      }}
    />
  )
}
