import { Outlet, useLoaderData } from '@remix-run/react'
import type { LoaderFunction, MetaFunction } from '@remix-run/cloudflare'
import { getValidatedSessionContext } from '~/session.server'
import { Popover } from '@headlessui/react'
import SideMenu from '~/components/SideMenu'
import Header from '~/components/Header'

import type { AddressURN } from '@proofzero/urns/address'
import type { NodeType } from '@proofzero/types/address'
import {
  getAccountClient,
  getAddressClient,
  getStarbaseClient,
} from '~/platform.server'
import type { AccountURN } from '@proofzero/urns/account'

export const loader: LoaderFunction = async ({ request, context }) => {
  const { jwt, accountUrn } = await getValidatedSessionContext(
    request,
    context.consoleParams,
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
        const { name, iconURL } = await starbaseClient.getAppPublicProps.query({
          clientId: a.clientId,
        })

        return {
          clientId: a.clientId,
          icon: iconURL,
          title: name,
          timestamp: a.timestamp,
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

  return {
    pfpUrl: accountProfile?.pfp?.image,
    displayName: accountProfile?.displayName,
    authorizedApps: authorizedApps,
    connectedProfiles: normalizedConnectedProfiles,
    CONSOLE_URL: context.env.CONSOLE_APP_URL,
  }
}

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'Passport Settings',
  viewport: 'width=device-width,initial-scale=1',
})

export default function SettingsLayout() {
  const {
    authorizedApps,
    connectedProfiles,
    displayName,
    pfpUrl,
    CONSOLE_URL,
  } = useLoaderData()

  return (
    <Popover className="bg-gray-50 min-h-screen relative">
      {({ open }) => {
        return (
          <div className="flex lg:flex-row h-full">
            <SideMenu CONSOLE_URL={CONSOLE_URL} open={open} />

            <div className={`flex flex-col w-full`}>
              <Header pfpUrl={pfpUrl} />
              <div
                className={`${
                  open
                    ? 'max-lg:opacity-50\
                    max-lg:overflow-hidden\
                    max-lg:h-[calc(100vh-80px)]'
                    : 'h-full'
                }`}
              >
                <Outlet context={{ authorizedApps, connectedProfiles }} />
              </div>
            </div>
          </div>
        )
      }}
    </Popover>
  )
}
