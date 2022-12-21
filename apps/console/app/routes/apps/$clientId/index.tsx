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
  if (!params.clientId) {
    throw new Error('Application client id is required for the requested route')
  }

  const jwt = await requireJWT(request)
  const starbaseClient = getStarbaseClient(jwt)

  const appDetails = (await starbaseClient.kb_appDetails(params.clientId)) as {
    appId: string
    clientId: string
    hasSecret: boolean
    app: {
      timestamp: number
      title: string
    }
  }

  let rotatedSecret
  if (!appDetails.hasSecret) {
    rotatedSecret = await starbaseClient.kb_appRotateSecret(appDetails.clientId)

    // For some reason secret is
    // secret:{actualSecret}
    // so to not break anything
    // taking care of this client server side
    rotatedSecret = rotatedSecret.secret.split(':')[1]
  }

  return json({
    app: appDetails,
    rotatedSecret: rotatedSecret,
  })
}

// Component
// -----------------------------------------------------------------------------

export default function AppDetailIndexPage() {
  const { app, rotatedSecret } = useLoaderData()

  return (
    <ApplicationDashboard
      galaxyGql={{
        createdAt: new Date(),
        onKeyRoll: () => {},
      }}
      oAuth={{
        appId: app.appId,
        appSecret: rotatedSecret,
        createdAt: new Date(),
        onKeyRoll: () => {},
      }}
    />
  )
}
