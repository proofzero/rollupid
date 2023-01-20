import type { LoaderFunction, ActionFunction } from '@remix-run/cloudflare'

import { Outlet, useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/cloudflare'

import SiteMenu from '~/components/SiteMenu'
import SiteHeader from '~/components/SiteHeader'

import toast, { Toaster } from 'react-hot-toast'

import rotateSecrets, { RollType } from '~/helpers/rotation'

import { requireJWT } from '~/utilities/session.server'
import { getGalaxyClient } from '~/utilities/platform.server'
import createStarbaseClient from '@kubelt/platform-clients/starbase'
import { PlatformJWTAssertionHeader } from '@kubelt/types/headers'
import type { appDetailsProps } from '~/components/Applications/Auth/ApplicationAuth'

type AppData = {
  clientId: string
  name?: string
  icon?: string
}[]

type LoaderData = {
  apps: AppData
  avatarUrl: string
  appDetails: appDetailsProps
  rotatedSecret?: string
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
    //----- default route
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

    //----- `/auth` route
    const appDetails = await starbaseClient.getAppDetails.query({
      clientId: clientId as string,
    })

    let rotatedSecret
    if (!appDetails.secretTimestamp) {
      rotatedSecret = await starbaseClient.rotateClientSecret.mutate({
        clientId: appDetails.clientId,
      })

      // The prefix is there just as an aide to users;
      // when they're moving these values
      // (client ID, client secret),
      // the prefix should help distinguish between them,
      // rather then the user having to
      // distinguish between them by e.g. length.
      // The prefix is part of the secret and is included in the stored hash.
      rotatedSecret = rotatedSecret.secret.split(':')[1]

      // This is a client 'hack' as the date
      // is populated from the graph
      // on subsequent requests
      appDetails.secretTimestamp = Date.now()
    }
    let rotationResult
    //If there's no timestamps, then the secrets have never been set, signifying the app
    //has just been created; we rotate both secrets and set the timestamps
    if (!appDetails.secretTimestamp && !appDetails.apiKeyTimestamp) {
      rotationResult = await rotateSecrets(
        starbaseClient,
        appDetails.clientId,
        RollType.RollBothSecrets
      )
      appDetails.secretTimestamp = appDetails.apiKeyTimestamp = Date.now()
    }

    return json<LoaderData>({
      apps: reshapedApps,
      rotatedSecrets: rotationResult,
      avatarUrl,
      appDetails,
      rotatedSecret,
    })
  } catch (error) {
    console.error({ error })
    return json({ error }, { status: 500 })
  }
}

// Component
// -----------------------------------------------------------------------------

export default function AppDetailIndexPage() {
  const loaderData = useLoaderData<LoaderData>()

  const { apps, avatarUrl } = loaderData
  const { appDetails, rotatedSecret } = loaderData
  const { rotateSecrets } = loaderData

  console.log(loaderData)

  const notify = (success: boolean = true) => {
    if (success) {
      toast.success('Saved', { duration: 2000 })
    } else {
      toast.error('Save Failed -- Please try again', { duration: 2000 })
    }
  }

  return (
    <div className="flex flex-col md:flex-row min-h-full">
      <SiteMenu apps={apps} selected={appDetails.clientId} />

      <main className="flex flex-col flex-initial min-h-full w-full bg-gray-50">
        <SiteHeader avatarUrl={avatarUrl} />
        <Toaster position="top-right" reverseOrder={false} />
        <section className="mx-11 my-9">
          <Outlet
            context={{
              notificationHandler: notify,
              appDetails,
              rotatedSecret,
              rotateSecrets,
            }}
          />
        </section>
      </main>
    </div>
  )
}
