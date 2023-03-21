import { Outlet, useLoaderData } from '@remix-run/react'
import { Text } from '@proofzero/design-system'
import type { LoaderFunction } from '@remix-run/cloudflare'
import { getUserSession, parseJwt } from '~/session.server'

import createAccountClient from '@proofzero/platform-clients/account'
import createStarbaseClient from '@proofzero/platform-clients/starbase'
import createAddressClient from '@proofzero/platform-clients/address'

import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import type { AccountURN } from '@proofzero/urns/account'
import type { AddressURN } from '@proofzero/urns/address'
import { PlatformAddressURNHeader } from '@proofzero/types/headers'

export const loader: LoaderFunction = async ({ request, context }) => {
  const { data } = await getUserSession(request, context.env)
  const jwt = data.jwt
  const traceHeader = generateTraceContextHeaders(context.traceSpan)
  const accountURN = parseJwt(jwt).sub as AccountURN

  if (!jwt) {
    throw new Error('You need to log-in first.')
  }

  const accountClient = createAccountClient(context.env.Account, {
    ...getAuthzHeaderConditionallyFromToken(jwt),
    ...traceHeader,
  })

  const starbaseClient = createStarbaseClient(context.env.Starbase, {
    ...getAuthzHeaderConditionallyFromToken(jwt),
    ...traceHeader,
  })

  const connectedProfiles = await accountClient.getAddresses.query({
    account: accountURN,
  })

  const addressURNList = connectedProfiles?.map(
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

  return { authorizedApps, addressProfiles }
}

export default function SettingsLayout() {
  const { authorizedApps, addressProfiles } = useLoaderData()

  console.log({ authorizedApps, addressProfiles })

  return (
    <div>
      <Text>Passport Setting</Text>
      <Outlet />
    </div>
  )
}
