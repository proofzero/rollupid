/**
 * @file app/routes/dashboard/index.tsx
 */

import type { LoaderFunction } from '@remix-run/cloudflare'

import { useLoaderData, useOutletContext } from '@remix-run/react'
import { json } from '@remix-run/cloudflare'

import folderPlus from '~/images/folderPlus.svg'

import { Button } from '@proofzero/design-system/src/atoms/buttons/Button'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'

//import { useUser } from "~/utils";

import SiteMenu from '~/components/SiteMenu'
import SiteHeader from '~/components/SiteHeader'

import AppBox from '~/components/AppBox'
import { Popover } from '@headlessui/react'
import { useState } from 'react'
import { NewAppModal } from '~/components/NewAppModal/NewAppModal'
import { parseJwt, requireJWT } from '~/utilities/session.server'
import { InfoPanelDashboard } from '~/components/InfoPanel/InfoPanelDashboard'
import createStarbaseClient from '@proofzero/platform-clients/starbase'
import createAccountClient from '@proofzero/platform-clients/account'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import type { AccountURN } from '@proofzero/urns/account'

type LoaderData = {
  apps: {
    clientId: string
    name?: string
    icon?: string
    published?: boolean
    createdTimestamp?: number
  }[]
  avatarUrl: string
  PASSPORT_URL: string
  displayName: string
}

export const loader: LoaderFunction = async ({ request, context }) => {
  const jwt = await requireJWT(request)
  const traceHeader = generateTraceContextHeaders(context.traceSpan)
  const parsedJwt = parseJwt(jwt)
  const accountURN = parsedJwt.sub as AccountURN

  try {
    const accountClient = createAccountClient(Account, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })
    const starbaseClient = createStarbaseClient(Starbase, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })
    const apps = await starbaseClient.listApps.query()
    const reshapedApps = apps.map((a) => {
      return {
        clientId: a.clientId,
        name: a.app?.name,
        icon: a.app?.icon,
        published: a.published,
        createdTimestamp: a.createdTimestamp,
      }
    })

    let avatarUrl = ''
    let displayName = ''
    try {
      const profile = await accountClient.getProfile.query({
        account: accountURN,
      })
      avatarUrl = profile?.pfp?.image || ''
      displayName = profile?.displayName || ''
    } catch (e) {
      console.error('Could not retrieve profile image.', e)
    }

    return json<LoaderData>({
      apps: reshapedApps,
      avatarUrl,
      PASSPORT_URL,
      displayName,
    })
  } catch (error) {
    console.error({ error })
    return json({ error }, { status: 500 })
  }
}

// Component
// -----------------------------------------------------------------------------

export default function DashboardIndexPage() {
  const { apps, avatarUrl, PASSPORT_URL, displayName } =
    useLoaderData<LoaderData>()
  const [newAppModalOpen, setNewAppModalOpen] = useState(false)

  const { profileURL } = useOutletContext<{ profileURL: string }>()
  return (
    <Popover className="min-h-screen relative">
      {({ open }) => (
        <div className="flex lg:flex-row h-full">
          <SiteMenu
            apps={apps}
            PASSPORT_URL={PASSPORT_URL}
            open={open}
            pfpUrl={avatarUrl}
            displayName={displayName}
          />
          <main className="flex flex-col flex-initial min-h-full w-full bg-white">
            <SiteHeader avatarUrl={avatarUrl} profileURL={profileURL} />
            <div
              className={`${
                open
                  ? 'max-lg:opacity-50\
                    max-lg:overflow-hidden\
                    max-lg:h-[calc(100vh-80px)]\
                    min-h-[635px]'
                  : 'h-full'
              }} bg-gray-50 p-6 h-full`}
            >
              <div className="mb-11">
                <InfoPanelDashboard />
              </div>

              {apps?.length > 0 && (
                <AppBox createLink="/dashboard/new" apps={apps} />
              )}

              {apps?.length === 0 && (
                <>
                  <Text
                    size="base"
                    weight="semibold"
                    className="text-gray-900 mb-6"
                  >
                    Your Applications
                  </Text>

                  <div className="text-center m-auto">
                    <img
                      className="inline-block mb-2"
                      src={folderPlus}
                      alt="Wallet icon"
                    />

                    <Text weight="semibold" className="text-gray-900">
                      No Applications
                    </Text>
                    <Text weight="medium" className="text-gray-500 mb-6">
                      Get started by creating an Application.
                    </Text>

                    <Button
                      btnType="primary-alt"
                      btnSize="l"
                      onClick={() => {
                        setNewAppModalOpen(true)
                      }}
                    >
                      Create Application
                    </Button>
                  </div>
                  <NewAppModal
                    isOpen={newAppModalOpen}
                    newAppCreateCallback={(app) => {
                      setNewAppModalOpen(false)
                    }}
                  />
                </>
              )}
            </div>
          </main>
        </div>
      )}
    </Popover>
  )
}
