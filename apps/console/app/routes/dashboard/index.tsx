/**
 * @file app/routes/dashboard/index.tsx
 */

import type { LoaderFunction } from '@remix-run/cloudflare'

import { Link, useLoaderData, useOutletContext } from '@remix-run/react'
import { json } from '@remix-run/cloudflare'

import folderPlus from '~/images/folderPlus.svg'

import { Button } from '@kubelt/design-system/src/atoms/buttons/Button'
import { Text } from '@kubelt/design-system/src/atoms/text/Text'

//import { useUser } from "~/utils";

import SiteMenu from '~/components/SiteMenu'
import SiteHeader from '~/components/SiteHeader'

import AppBox from '~/components/AppBox'
import { useState } from 'react'
import { NewAppModal } from '~/components/NewAppModal/NewAppModal'
import { requireJWT } from '~/utilities/session.server'
import { getGalaxyClient } from '~/utilities/platform.server'
import { InfoPanelDashboard } from '~/components/InfoPanel/InfoPanelDashboard'
import createStarbaseClient from '@kubelt/platform-clients/starbase'
import { getAuthzHeaderConditionallyFromToken } from '@kubelt/utils'
import { generateTraceContextHeaders } from '@kubelt/platform-middleware/trace'

type LoaderData = {
  apps: {
    clientId: string
    name?: string
    icon?: string
    published?: boolean
    createdTimestamp?: number
  }[]
  avatarUrl: string
}

export const loader: LoaderFunction = async ({ request, context }) => {
  const jwt = await requireJWT(request)
  const traceHeader = generateTraceContextHeaders(context.traceSpan)

  const galaxyClient = await getGalaxyClient(traceHeader)
  try {
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
    try {
      const profileRes = await galaxyClient.getProfile(
        undefined,
        getAuthzHeaderConditionallyFromToken(jwt)
      )
      avatarUrl = profileRes.profile?.pfp?.image || ''
    } catch (e) {
      console.error('Could not retrieve profile image.', e)
    }

    return json<LoaderData>({ apps: reshapedApps, avatarUrl })
  } catch (error) {
    console.error({ error })
    return json({ error }, { status: 500 })
  }
}

// Component
// -----------------------------------------------------------------------------

export default function DashboardIndexPage() {
  const { apps, avatarUrl } = useLoaderData<LoaderData>()
  const [newAppModalOpen, setNewAppModalOpen] = useState(false)

  const { profileURL } = useOutletContext<{ profileURL: string }>()
  return (
    <div className="flex flex-col md:flex-row min-h-full">
      <SiteMenu apps={apps} />
      <main className="flex flex-col flex-initial min-h-full w-full bg-white">
        <SiteHeader avatarUrl={avatarUrl} profileURL={profileURL} />
        <div className="bg-gray-50 p-6 h-full">
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
  )
}
