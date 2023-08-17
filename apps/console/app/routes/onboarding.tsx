import { json, type LoaderFunction } from '@remix-run/cloudflare'
import onboardingImage from '../images/console_onboarding.svg'

import { Outlet, useLoaderData } from '@remix-run/react'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { requireJWT } from '~/utilities/session.server'
import { checkToken } from '@proofzero/utils/token'
import type { AccountURN } from '@proofzero/urns/account'
import createCoreClient from '@proofzero/platform-clients/core'
import { getEmailDropdownItems } from '@proofzero/utils/getNormalisedConnectedAccounts'
import { type DropdownSelectListItem } from '@proofzero/design-system/src/atoms/dropdown/DropdownSelectList'

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const jwt = await requireJWT(request, context.env)
    const payload = checkToken(jwt!)
    const accountURN = payload.sub as AccountURN

    const coreClient = createCoreClient(context.env.Core, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...generateTraceContextHeaders(context.traceSpan),
    })

    const connectedAccounts = await coreClient.account.getAddresses.query({
      account: accountURN,
    })
    const connectedEmails = getEmailDropdownItems(connectedAccounts)

    return json({
      connectedEmails,
      PASSPORT_URL: context.env.PASSPORT_URL,
    })
  }
)

export default function Onboarding() {
  const { connectedEmails, PASSPORT_URL } = useLoaderData<{
    connectedEmails: DropdownSelectListItem[]
    PASSPORT_URL: string
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
          <Outlet context={{ connectedEmails, PASSPORT_URL }} />
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
