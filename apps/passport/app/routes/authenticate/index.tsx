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

  let res = {}
  if (clientId) {
    const sbClient = getStarbaseClient('', context.env)
    res = await sbClient.getAppPublicProps.query({ clientId })
  }

  const searchParams = new URL(request.url).searchParams

  // If we have the prompt login param, we should prevent
  // the connectCallback which can immediately
  // take us to the sign screen when loading
  if (searchParams.get('prompt') === 'login') {
    res = {
      ...res,
      preventConnectCallback: true,
    }
  }

  return res
}

export default function Authenticate() {
  const [enableWalletConnect, setEnableWalletConnect] = useState(true)
  const loaderData = useLoaderData<{
    name: string
    iconURL: string
    preventConnectCallback: boolean | undefined
  }>()
  const name = loaderData?.name || undefined
  const iconURL = loaderData?.iconURL || undefined

  const preventConnectCallback = loaderData?.preventConnectCallback

  return (
    <Authentication
      logoURL={iconURL}
      appName={name}
      enableWalletConnect={enableWalletConnect}
      connectCallback={async (address) => {
        // This should stop the ConnectWallet
        // from automagically redirecting
        // to the signing page when
        // requesting extra connection
        // if already connected
        // with ETH wallet
        if (preventConnectCallback) return

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
