/**
 * @file app/routes/dashboard.tsx
 */

import type { LoaderFunction } from '@remix-run/cloudflare'

import { Outlet, useLoaderData, useLocation } from '@remix-run/react'
import { json } from '@remix-run/cloudflare'

import type { Application } from '~/models/app.server'
import { getApplicationListItems } from '~/models/app.server'
import { requireJWT } from '~/shared/utilities/session.server'

//import { useUser } from "~/utils";

import SiteMenu from '~/components/SiteMenu'
import SiteHeader from '~/components/SiteHeader'

// Loader
// -----------------------------------------------------------------------------

type LoaderData = {
  apps: Awaited<ReturnType<typeof getApplicationListItems>>
}

export const loader: LoaderFunction = async ({ request }) => {
  const jwt = await requireJWT(request)
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

export default function DashboardPage() {
  const location = useLocation()
  const path = location?.pathname

  //const user = useUser();
  const wallet = '0xfoobar'

  const data = useLoaderData() as LoaderData
  const apps = data?.apps.length > 0 ? data.apps : []

  // TODO get application ID for currently selected application
  const appId = 'courtyard'

  return (
    <div className="flex flex-col md:flex-row min-h-full">
      <SiteMenu apps={apps} selected={appId} path={path} />
      <main className="flex flex-col flex-initial min-h-full w-full bg-white">
        <SiteHeader wallet={wallet} />
        <div className="bg-gray-200 p-6 h-full">
          <Outlet context={{ apps, appId }} />
        </div>
      </main>
    </div>
  )
}
