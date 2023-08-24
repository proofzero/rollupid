import { json, redirect, type LoaderFunction } from '@remix-run/cloudflare'
import onboardingImage from '../images/console_onboarding.svg'

import {
  Outlet,
  type ShouldRevalidateFunction,
  useLoaderData,
} from '@remix-run/react'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { requireJWT } from '~/utilities/session.server'
import { checkToken } from '@proofzero/utils/token'
import type { IdentityURN } from '@proofzero/urns/identity'
import createCoreClient from '@proofzero/platform-clients/core'
import { getEmailDropdownItems } from '@proofzero/utils/getNormalisedConnectedAccounts'
import { type DropdownSelectListItem } from '@proofzero/design-system/src/atoms/dropdown/DropdownSelectList'
import type { Profile } from '@proofzero/platform.identity/src/types'

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const jwt = await requireJWT(request, context.env)
    const payload = checkToken(jwt!)
    const identityURN = payload.sub as IdentityURN

    const coreClient = createCoreClient(context.env.Core, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...generateTraceContextHeaders(context.traceSpan),
    })

    const profile = await coreClient.identity.getProfile.query({
      identity: identityURN,
    })

    if (profile?.consoleOnboardingData?.isComplete) {
      return redirect('/')
    }

    const connectedAccounts = await coreClient.identity.getAccounts.query({
      identity: identityURN,
    })
    const connectedEmails = getEmailDropdownItems(connectedAccounts)

    return json({
      profile,
      connectedEmails,
      PASSPORT_URL: context.env.PASSPORT_URL,
    })
  }
)

// https://remix.run/docs/en/main/route/should-revalidate#actionresult
export const shouldRevalidate: ShouldRevalidateFunction = ({
  actionResult,
  defaultShouldRevalidate,
}) => {
  if (actionResult?.success) {
    return false
  }
  return defaultShouldRevalidate
}

export default function Onboarding() {
  const { connectedEmails, PASSPORT_URL, profile } = useLoaderData<{
    connectedEmails: DropdownSelectListItem[]
    PASSPORT_URL: string
    profile: Profile
  }>()

  return (
    <div>
      <div
        className={`flex flex-row items-center justify-center h-[100dvh] bg-white dark:bg-gray-900`}
      >
        <div
          className={
            'basis-full 2xl:basis-2/5 flex items-start justify-center py-[2.5%] h-full'
          }
        >
          <Outlet context={{ connectedEmails, PASSPORT_URL, profile }} />
        </div>
        <div className="basis-3/5 h-[100dvh] w-full hidden 2xl:flex justify-end items-center bg-gray-50 dark:bg-gray-800 overflow-hidden">
          <img
            className="max-h-fit mt-[10%]"
            alt="onboarding"
            src={onboardingImage}
          />
        </div>
      </div>
    </div>
  )
}
