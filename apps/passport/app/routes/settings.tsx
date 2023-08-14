import { Outlet, useLoaderData } from '@remix-run/react'

import { json, redirect } from '@remix-run/cloudflare'
import {
  getDefaultAuthzParams,
  getValidatedSessionContext,
} from '~/session.server'
import { Popover } from '@headlessui/react'
import SideMenu from '~/components/SideMenu'
import Header from '~/components/Header'

import appleIcon from '~/assets/apple-touch-icon.png'
import icon32 from '~/assets/favicon-32x32.png'
import icon16 from '~/assets/favicon-16x16.png'
import faviconSvg from '~/assets/favicon.svg'
import noImg from '~/assets/noImg.svg'

import { getCoreClient } from '~/platform.server'

import type { AddressURN } from '@proofzero/urns/address'
import type { NodeType } from '@proofzero/types/address'
import type {
  LoaderFunction,
  MetaFunction,
  LinksFunction,
} from '@remix-run/cloudflare'

import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'

import { usePostHog } from 'posthog-js/react'
import { useEffect, useState } from 'react'

export type AuthorizedAppsModel = {
  clientId: string
  icon: string
  timestamp: number
  title?: string
  appDataError?: boolean
  appScopeError?: boolean
}

export const links: LinksFunction = () => [
  { rel: 'apple-touch-icon', href: appleIcon, sizes: '180x180' },
  { rel: 'icon', type: 'image/png', href: icon32, sizes: '32x32' },
  { rel: 'icon', type: 'image/png', href: icon16, sizes: '16x16' },
  { rel: 'shortcut icon', type: 'image/svg+xml', href: faviconSvg },
]

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const host = request.headers.get('host') as string
    if (!context.env.DEFAULT_HOSTS.includes(host)) {
      throw redirect('/not-found')
    }

    const passportDefaultAuthzParams = getDefaultAuthzParams(request)

    const { jwt, accountUrn } = await getValidatedSessionContext(
      request,
      passportDefaultAuthzParams,
      context.env,
      context.traceSpan
    )

    const coreClient = getCoreClient({ context, jwt })

    const accountProfile = await coreClient.account.getProfile.query({
      account: accountUrn,
    })

    const addressTypeUrns = accountProfile?.addresses.map((a) => ({
      urn: a.baseUrn,
      nodeType: a.rc.node_type,
    })) as { urn: AddressURN; nodeType: NodeType }[]

    const addresses = addressTypeUrns.map((atu) => atu.urn)

    const apps = await coreClient.account.getAuthorizedApps.query({
      account: accountUrn,
    })

    const awaitedResults = await Promise.all([
      Promise.all(
        apps.map(async (a) => {
          const appAuthorizedScopes =
            await coreClient.access.getAuthorizedAppScopes.query({
              clientId: a.clientId,
              accountURN: accountUrn,
            })

          return {
            clientId: a.clientId,
            timestamp: a.timestamp,
            appScopeError: Object.entries(appAuthorizedScopes.claimValues).some(
              ([_, value]) => !value.meta.valid
            ),
          }
        })
      ),
      coreClient.starbase.getAppPublicPropsBatch.query({
        apps: apps.map((a) => ({ clientId: a.clientId })),
        silenceErrors: true,
      }),
      coreClient.address.getAddressProfileBatch.query(addresses),
    ])

    const [authorizedApps, appsPublicProps, addressProfiles] = awaitedResults

    const authzAppResults: AuthorizedAppsModel[] = []
    authorizedApps.forEach((authzApp, index) => {
      //Merging props from authorizedApps and appsPublicProps
      const appPublicProps = appsPublicProps[index]
      if (appPublicProps)
        authzAppResults.push({
          ...authzApp,
          icon: appPublicProps.iconURL,
          title: appPublicProps.name,
        })
      else
        authzAppResults.push({ ...authzApp, icon: noImg, appDataError: true })
    })

    const normalizedConnectedProfiles = addressProfiles.map((p, i) => ({
      ...addressTypeUrns[i],
      ...p,
    }))

    return json({
      pfpUrl: accountProfile?.pfp?.image,
      displayName: accountProfile?.displayName,
      authorizedApps: authzAppResults,
      connectedProfiles: normalizedConnectedProfiles,
      CONSOLE_URL: context.env.CONSOLE_APP_URL,
      primaryAddressURN: accountProfile?.primaryAddressURN,
      accountUrn,
    })
  }
)

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'Passport Settings - Rollup',
  viewport: 'width=device-width,initial-scale=1',
})

export default function SettingsLayout() {
  const {
    authorizedApps,
    connectedProfiles,
    pfpUrl,
    CONSOLE_URL,
    displayName,
    primaryAddressURN,
    accountUrn,
  } = useLoaderData()

  const [isIdentified, setIsIdentified] = useState(false)
  const posthog = usePostHog()

  // need to identify only once
  useEffect(() => {
    if (!isIdentified) posthog?.identify(accountUrn)
    setIsIdentified(true)
  }, [isIdentified])

  return (
    <Popover className="bg-white lg:bg-gray-50 min-h-[100dvh] relative">
      {({ open }) => {
        return (
          <div className="flex lg:flex-row h-full">
            <SideMenu
              CONSOLE_URL={CONSOLE_URL}
              pfpUrl={pfpUrl}
              open={open}
              displayName={displayName}
            />

            <div className={`flex flex-col w-full`}>
              <Header pfpUrl={pfpUrl} />
              <div
                className={`${
                  open
                    ? 'max-lg:opacity-50\
                    max-lg:overflow-hidden\
                    max-lg:h-[calc(100dvh-80px)]\
                    min-h-[416px]'
                    : 'h-full'
                } px-2 sm:max-md:px-5 md:px-10
                pb-5 md:pb-10 pt-6 bg-white lg:bg-gray-50`}
              >
                <Outlet
                  context={{
                    authorizedApps,
                    connectedProfiles,
                    primaryAddressURN,
                    CONSOLE_URL,
                  }}
                />
              </div>
            </div>
          </div>
        )
      }}
    </Popover>
  )
}
