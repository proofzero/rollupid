/**
 * @file app/routes/dashboard/apps/$appId/index.tsx
 */

import { json, LoaderFunction } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import { ApplicationDashboard } from '~/components/Applications/Dashboard/ApplicationDashboard'
import { getStarbaseClient } from '~/utilities/platform.server'
import { requireJWT } from '~/utilities/session.server'

// Component
// -----------------------------------------------------------------------------
/**
 * @file app/routes/dashboard/index.tsx
 */

export const loader: LoaderFunction = async ({ request, params }) => {
  if (!params.appId) {
    throw new Error('Application id is required for the requested route')
  }

  const jwt = await requireJWT(request)
  const starbaseClient = getStarbaseClient(jwt)

  // Figure out how to get app details
  // const appDetails = await starbaseClient.
  const appDetails = {
    id: params.appId,
  }

  return json({
    app: appDetails,
  })
}

// Component
// -----------------------------------------------------------------------------

export default function AppDetailIndexPage() {
  const { app } = useLoaderData()

  return (
    <section className="mx-11 my-9">
      <ApplicationDashboard
        galaxyGql={{
          apiKey: 'Fubar',
          createdAt: new Date(),
          onKeyRoll: () => {},
        }}
        oAuth={{
          appId: app.id,
          appSecret: 'SECRET',
          createdAt: new Date(),
          onKeyRoll: () => {},
        }}
      />
    </section>
  )
}
