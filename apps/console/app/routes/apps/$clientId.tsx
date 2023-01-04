import type { LoaderFunction } from '@remix-run/cloudflare'

import { Outlet, useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/cloudflare'

import SiteMenu from '~/components/SiteMenu'
import SiteHeader from '~/components/SiteHeader'

import { requireJWT } from '~/utilities/session.server'
import { getGalaxyClient, getStarbaseClient } from '~/utilities/platform.server'
import { PlatformJWTAssertionHeader } from '@kubelt/platform-middleware/jwt'

type AppData = 
  {
    clientId: string
    name: string
    icon: string
  }[]


type LoaderData = {
  apps: AppData
  clientId: string | undefined
  avatarUrl: string
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const jwt = await requireJWT(request)
  const starbaseClient = getStarbaseClient(jwt)
  const galaxyClient = await getGalaxyClient()

  const clientId = params?.clientId

  try {
    const apps = (await starbaseClient.kb_appList()) as AppData

    const profileRes = await galaxyClient.getProfile(undefined, {
      [PlatformJWTAssertionHeader]: jwt,
    })
  
    const avatarUrl = profileRes.profile?.pfp?.image || ''
  
    return json<LoaderData>({ apps, clientId, avatarUrl })
  } catch (error) {
    console.error({ error })
    return json({ error }, { status: 500 })
  }
}

// Component
// -----------------------------------------------------------------------------

export default function AppDetailIndexPage() {
  const { apps, clientId, avatarUrl } = useLoaderData<LoaderData>()

  return (
    <div className="flex flex-col md:flex-row min-h-full">
      <SiteMenu apps={apps} selected={clientId} />

      <main className="flex flex-col flex-initial min-h-full w-full bg-gray-50">
        <SiteHeader avatarUrl={avatarUrl} />

        <section className="mx-11 my-9">
          <Outlet />
        </section>
      </main>
    </div>
  )
}
