import type { LoaderFunction } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import { useState } from 'react'
import { Authentication } from '~/components'
import { getStarbaseClient } from '~/platform.server'
import { getConsoleParamsSession } from '~/session.server'

export const loader: LoaderFunction = async ({ request, context }) => {
  const consoleParmamsSessionFromCookie = await getConsoleParamsSession(
    request,
    context.env
  )
  const consoleParamsSession = consoleParmamsSessionFromCookie.get('params')
  const parsedParams = consoleParamsSession
    ? await JSON.parse(consoleParamsSession)
    : undefined
  const clientId = parsedParams?.clientId || undefined

  if (clientId) {
    const sbClient = getStarbaseClient('', context.env)
    const response = await sbClient.getAppPublicProps.query({ clientId })
    return response
  } else {
    return null
  }
}

export default function Authenticate() {
  const [enableWalletConnect, setEnableWalletConnect] = useState(true)
  const loaderData = useLoaderData<{ name: string; iconURL: string }>()
  const name = loaderData?.name || undefined
  const iconURL = loaderData?.iconURL || undefined

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
