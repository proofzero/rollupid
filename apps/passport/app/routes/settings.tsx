import { Outlet, useLoaderData } from '@remix-run/react'
import type { LoaderFunction, MetaFunction } from '@remix-run/cloudflare'

import createAccountClient from '@proofzero/platform-clients/account'
import createStarbaseClient from '@proofzero/platform-clients/starbase'
import createAddressClient from '@proofzero/platform-clients/address'

import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { getUserSession, parseJwt } from '~/session.server'

import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { PlatformAddressURNHeader } from '@proofzero/types/headers'

import { Popover } from '@headlessui/react'
import SideMenu from '~/components/SideMenu'
import Header from '~/components/Header'

import type { AccountURN } from '@proofzero/urns/account'
import type { AddressURN } from '@proofzero/urns/address'

export const loader: LoaderFunction = async ({ request, context }) => {
  const { data } = await getUserSession(request, context.env)
  const jwt = data.jwt
  const traceHeader = generateTraceContextHeaders(context.traceSpan)
  const accountURN = parseJwt(jwt).sub as AccountURN

  if (!jwt) {
    throw new Error('You need to be logged in')
  }

  const accountClient = createAccountClient(context.env.Account, {
    ...getAuthzHeaderConditionallyFromToken(jwt),
    ...traceHeader,
  })

  const starbaseClient = createStarbaseClient(context.env.Starbase, {
    ...getAuthzHeaderConditionallyFromToken(jwt),
    ...traceHeader,
  })

  const accountProfile = await accountClient.getProfile.query({
    account: accountURN,
  })

  const addressURNList = accountProfile?.addresses?.map(
    (profile) => profile.baseUrn as AddressURN
  ) as AddressURN[]

  const awaitedResult = await Promise.all([
    starbaseClient.listApps.query(),
    ...addressURNList.map((address) => {
      const addressClient = createAddressClient(context.env.Address, {
        [PlatformAddressURNHeader]: address,
        ...getAuthzHeaderConditionallyFromToken(jwt),
        ...traceHeader,
      })
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
