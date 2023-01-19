import type { LoaderFunction } from '@remix-run/cloudflare'

import { Outlet, useLoaderData, useOutletContext } from '@remix-run/react'
import { json } from '@remix-run/cloudflare'

import SiteMenu from '~/components/SiteMenu'
import SiteHeader from '~/components/SiteHeader'

import toast, { Toaster } from 'react-hot-toast'

import { requireJWT } from '~/utilities/session.server'
import { getGalaxyClient } from '~/utilities/platform.server'
import createStarbaseClient from '@kubelt/platform-clients/starbase'
import { PlatformJWTAssertionHeader } from '@kubelt/types/headers'

type AppData = {
  clientId: string
  name?: string
  icon?: string
}[]

type LoaderData = {
  apps: AppData
  clientId: string | undefined
  avatarUrl: string
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const jwt = await requireJWT(request)
  const starbaseClient = createStarbaseClient(Starbase, {
    headers: {
      [PlatformJWTAssertionHeader]: jwt,
    },
  })
  const galaxyClient = await getGalaxyClient()

  const clientId = params?.clientId

  try {
    const apps = await starbaseClient.listApps.query()
    const reshapedApps = apps.map((a) => {
      return { clientId: a.clientId, name: a.app?.name, icon: a.app?.icon }
    })

    let avatarUrl = ''
    try {
      const profileRes = await galaxyClient.getProfile(undefined, {
        [PlatformJWTAssertionHeader]: jwt,
      })
      avatarUrl = profileRes.profile?.pfp?.image || ''
    } catch (e) {
      console.error('Could not retrieve profile image.', e)
    }

    return json<LoaderData>({ apps: reshapedApps, clientId, avatarUrl })
  } catch (error) {
    console.error({ error })
    return json({ error }, { status: 500 })
  }
}

// Component
// -----------------------------------------------------------------------------

export default function AppDetailIndexPage() {
  const { apps, clientId, avatarUrl } = useLoaderData<LoaderData>()

  const notify = (success: boolean = true) => {
    if (success) {
      toast.success('Saved', { duration: 2000 })
    } else {
      toast.error('Save Failed -- Please try again', { duration: 2000 })
    }
  }

  return (
    <div className="flex flex-col md:flex-row min-h-full">
      <SiteMenu apps={apps} selected={clientId} />

      <main className="flex flex-col flex-initial min-h-full w-full bg-gray-50">
        <SiteHeader avatarUrl={avatarUrl} />
        <Toaster position="top-right" reverseOrder={false} />
        <section className="mx-11 my-9">
          <Outlet
            context={{
              notificationHandler: notify,
            }}
          />
        </section>
      </main>
    </div>
  )
}
