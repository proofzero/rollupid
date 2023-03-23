import { Outlet, useLoaderData } from '@remix-run/react'
import type { LoaderFunction, MetaFunction } from '@remix-run/cloudflare'
import { getValidatedSessionContext } from '~/session.server'
import { Popover } from '@headlessui/react'
import SideMenu from '~/components/SideMenu'
import Header from '~/components/Header'

import type { AddressURN } from '@proofzero/urns/address'
import {
  getAccountClient,
  getAddressClient,
  getStarbaseClient,
} from '~/platform.server'

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

  const addressURNList = accountProfile?.addresses?.map(
    (profile) => profile.baseUrn as AddressURN
  ) as AddressURN[]

  const awaitedResult = await Promise.all([
    starbaseClient.listApps.query(),
    ...addressURNList.map((address) => {
      const addressClient = getAddressClient(
        address,
        context.env,
        context.traceSpan
      )
      return addressClient.getAddressProfile.query()
    }),
  ])

  const authorizedApps = awaitedResult[0]
  const addressProfiles = awaitedResult.slice(1)

  return {
    pfpUrl: accountProfile?.pfp?.image,
    displayName: accountProfile?.displayName,
    authorizedApps,
    addressProfiles,
    CONSOLE_URL: context.env.CONSOLE_APP_URL,
  }
}

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'Passport Settings',
  viewport: 'width=device-width,initial-scale=1',
})

export default function SettingsLayout() {
  const { authorizedApps, addressProfiles, displayName, pfpUrl, CONSOLE_URL } =
    useLoaderData()

  return (
    <Popover className="bg-gray-50 min-h-screen relative">
      {({ open }) => {
        return (
          <div className="flex lg:flex-row">
            <SideMenu CONSOLE_URL={CONSOLE_URL} open={open} />

            <div className={`flex flex-col w-full`}>
              <Header pfpUrl={pfpUrl} />
              <div className={`${open ? 'max-lg:opacity-50' : ''}`}>
                <Outlet />
              </div>
            </div>
          </div>
        )
      }}
    </Popover>
  )
}
