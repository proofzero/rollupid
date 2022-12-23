import type { LoaderFunction } from '@remix-run/cloudflare'

import { Outlet, useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/cloudflare'

import SiteMenu from '~/components/SiteMenu'
import SiteHeader from '~/components/SiteHeader'

import { requireJWT } from '~/utilities/session.server'
import { getStarbaseClient } from '~/utilities/platform.server'

type LoaderData = {
  apps: {
    clientId: string
    name: string
  }[]
  clientId: string | undefined
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const jwt = await requireJWT(request)
  const starbaseClient = getStarbaseClient(jwt)

  const clientId = params?.clientId

  try {
    const apps = (await starbaseClient.kb_appList()) as {
      clientId: string
      name: string
    }[]

    return json<LoaderData>({ apps, clientId })
  } catch (error) {
    console.error({ error })
    return json({ error }, { status: 500 })
  }
}

// Component
// -----------------------------------------------------------------------------

type ContextType = {
  // The list of a user's applications.
  apps: {
    clientId: string
    name: string
    icon: string
  }[]
  clientId: string
}

export default function AppDetailIndexPage() {
  const { apps, clientId } = useLoaderData<ContextType>()

  return (
    <div className="flex flex-col md:flex-row min-h-full">
      <SiteMenu apps={apps} selected={clientId} />

      <main className="flex flex-col flex-initial min-h-full w-full bg-gray-50">
        <SiteHeader />

        <section className="mx-11 my-9">
          <Outlet />
        </section>
      </main>
    </div>
  )
}
