/**
 * @file app/routes/dashboard/index.tsx
 */

import type { LoaderFunction } from '@remix-run/cloudflare'

import { useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/cloudflare'

import type { Application } from '~/models/app.server'
import { getApplicationListItems } from '~/models/app.server'

//import { useUser } from "~/utils";

import SiteMenu from '~/components/SiteMenu'
import SiteHeader from '~/components/SiteHeader'

import AppBox from '~/components/AppBox'

type LoaderData = {
  apps: Awaited<ReturnType<typeof getApplicationListItems>>
}

export const loader: LoaderFunction = async ({ request }) => {
  //const apps = await getApplicationListItems(jwt);
  const apps = []
  return json<LoaderData>({ apps })
}

// Component
// -----------------------------------------------------------------------------

export type ContextType = {
  // The list of a user's applications.
  apps: Array<Application>
  // ID of the currently selected application.
  appId: string
}

export default function DashboardIndexPage() {
  const { apps, appId } = useLoaderData<ContextType>()

  return (
    <div className="flex flex-col md:flex-row min-h-full">
      <SiteMenu apps={apps} selected={appId} />
      <main className="flex flex-col flex-initial min-h-full w-full bg-white">
        <SiteHeader />
        <div className="bg-gray-200 p-6 h-full">
          <AppBox createLink="/dashboard/new" apps={apps} />
          {/* <Outlet context={{ apps, appId }} /> */}
        </div>
      </main>
    </div>
  )
}
