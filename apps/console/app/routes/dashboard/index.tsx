/**
 * @file app/routes/dashboard/index.tsx
 */

import type { LoaderFunction } from '@remix-run/cloudflare'

import { Link, useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/cloudflare'

import folderPlus from '~/images/folderPlus.svg'

import { Button } from '@kubelt/design-system/src/atoms/buttons/Button'

import { getApplicationListItems } from '~/models/app.server'

//import { useUser } from "~/utils";

import SiteMenu from '~/components/SiteMenu'
import SiteHeader from '~/components/SiteHeader'

import AppBox from '~/components/AppBox'
import { useState } from 'react'
import { NewAppModal } from '~/components/NewAppModal/NewAppModal'
import { requireJWT } from '~/utilities/session.server'
import { getStarbaseClient } from '~/utilities/platform.server'

type LoaderData = {
  apps: Awaited<ReturnType<typeof getApplicationListItems>>
}

export const loader: LoaderFunction = async ({ request }) => {
  const jwt = await requireJWT(request)
  const starbaseClient = getStarbaseClient(jwt)

  try {
    const apps = await starbaseClient.kb_appList() // TODO: update result type
    console.log({ appsRes: apps.result })
    return json<LoaderData>({ apps: apps.result })
  } catch (error) {
    console.error({ error })
    return json({ error }, { status: 500 })
  }
}

// Component
// -----------------------------------------------------------------------------

export default function DashboardIndexPage() {
  const { apps, appId } = useLoaderData()
  const [newAppModalOpen, setNewAppModalOpen] = useState(false)

  return (
    <div className="flex flex-col md:flex-row min-h-full">
      <SiteMenu apps={apps} selected={appId} />
      <main className="flex flex-col flex-initial min-h-full w-full bg-white">
        <SiteHeader />
        <div className="bg-gray-200 p-6 h-full">
          <AppBox createLink="/dashboard/new" apps={apps} />
          <div className="text-center mt-24 m-auto">
            <img className="inline-block" src={folderPlus} alt="Wallet icon" />
            <div className="text-black mt-4">No Applications</div>
            <p className="text-slate-500">
              Get started by creating an Application.
            </p>
            <Button
              btnSize="l"
              onClick={() => {
                console.log('opening', newAppModalOpen)
                setNewAppModalOpen(true)
              }}
            >
              Create Application"
            </Button>
          </div>
          <NewAppModal
            isOpen={newAppModalOpen}
            newAppCreateCallback={(app) => {
              setNewAppModalOpen(false)
            }}
          />
        </div>
      </main>
    </div>
  )
}
