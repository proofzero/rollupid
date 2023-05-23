import { Outlet, useLoaderData } from '@remix-run/react'

import { json } from '@remix-run/cloudflare'
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

import {
  getAccountClient,
  getAddressClient,
  getStarbaseClient,
} from '~/platform.server'

import type { AddressURN } from '@proofzero/urns/address'
import type { NodeType } from '@proofzero/types/address'
import type { LoaderFunction, MetaFunction } from '@remix-run/cloudflare'
import type { LinksFunction } from '@remix-run/cloudflare'

export type AuthorizedAppsModel = {
  clientId: string
  icon: string
  timestamp: number
  title?: string
  appDataError?: boolean
}

export const links: LinksFunction = () => [
  { rel: 'apple-touch-icon', href: appleIcon, sizes: '180x180' },
  { rel: 'icon', type: 'image/png', href: icon32, sizes: '32x32' },
  { rel: 'icon', type: 'image/png', href: icon16, sizes: '16x16' },
  { rel: 'shortcut icon', type: 'image/svg+xml', href: faviconSvg },
]

export const loader: LoaderFunction = async ({ request, context }) => {
  const passportDefaultAuthzParams = getDefaultAuthzParams(request)

  const { jwt, accountUrn } = await getValidatedSessionContext(
    request,
    passportDefaultAuthzParams,
    context.env,
    context.traceSpan
  )

  const accountClient = getAccountClient(jwt, context.env, context.traceSpan)
  const starbaseClient = getStarbaseClient(jwt, context.env, context.traceSpan)

  const accountProfile = await accountClient.getProfile.query({
    account: accountUrn,
  })

  const addressTypeUrns = accountProfile?.addresses.map((a) => ({
    urn: a.baseUrn,
    nodeType: a.rc.node_type,
  })) as { urn: AddressURN; nodeType: NodeType }[]

  const apps = await accountClient.getAuthorizedApps.query({
    account: accountUrn,
  })

  const awaitedResults = await Promise.all([
    Promise.all(
      apps.map(async (a) => {
        try {
          const { name, iconURL } =
            await starbaseClient.getAppPublicProps.query({
              clientId: a.clientId,
            })
          return {
            clientId: a.clientId,
            icon: iconURL,
            title: name,
            timestamp: a.timestamp,
          }
        } catch (e) {
          //We swallow the error and move on to next app
          console.error(e)
          return {
            clientId: a.clientId,
            icon: noImg,
            timestamp: a.timestamp,
            appDataError: true,
          }
        }
      })
    ),
    Promise.all(
      addressTypeUrns.map((address) => {
        const addressClient = getAddressClient(
          address.urn,
          context.env,
          context.traceSpan
        )
        return addressClient.getAddressProfile.query()
      })
    ),
  ])

  const authorizedApps = awaitedResults[0]
  const addressProfiles = awaitedResults[1]

  const normalizedConnectedProfiles = addressProfiles.map((p, i) => ({
    ...addressTypeUrns[i],
    ...p,
  }))

  return json({
    pfpUrl: accountProfile?.pfp?.image,
    displayName: accountProfile?.displayName,
    authorizedApps: authorizedApps,
    connectedProfiles: normalizedConnectedProfiles,
    CONSOLE_URL: context.env.CONSOLE_APP_URL,
    primaryAddressURN: accountProfile?.primaryAddressURN,
  })
}

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
  } = useLoaderData()

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
