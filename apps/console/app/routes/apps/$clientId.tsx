import type { LoaderFunction } from '@remix-run/cloudflare'

import { Outlet, useLoaderData, useOutletContext } from '@remix-run/react'
import { json } from '@remix-run/cloudflare'

import SiteMenu from '~/components/SiteMenu'
import SiteHeader from '~/components/SiteHeader'

import toast, { Toaster } from 'react-hot-toast'

import { requireJWT } from '~/utilities/session.server'
import { getGalaxyClient } from '~/utilities/platform.server'
import createStarbaseClient from '@kubelt/platform-clients/starbase'
import type { appDetailsProps } from '~/components/Applications/Auth/ApplicationAuth'
import { getAuthzHeaderConditionallyFromToken } from '@kubelt/utils'
import type { RotatedSecrets } from '~/types'

type AppData = {
  clientId: string
  name?: string
  icon?: string
}[]

type LoaderData = {
  apps: AppData
  avatarUrl: string
  appDetails: appDetailsProps
  rotationResult?: RotatedSecrets
}

export const loader: LoaderFunction = async ({ request, params }) => {
  if (!params.clientId) {
    throw new Error('Client ID is required for the requested route')
  }

  const jwt = await requireJWT(request)
  const starbaseClient = createStarbaseClient(
    Starbase,
    getAuthzHeaderConditionallyFromToken(jwt)
  )
  const galaxyClient = await getGalaxyClient()

  const clientId = params?.clientId

  try {
    const apps = await starbaseClient.listApps.query()
    const reshapedApps = apps.map((a) => {
      return { clientId: a.clientId, name: a.app?.name, icon: a.app?.icon }
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

    const appDetails = await starbaseClient.getAppDetails.query({
      clientId: clientId as string,
    })

    let rotationResult
    //If there's no timestamps, then the secrets have never been set, signifying the app
    //has just been created; we rotate both secrets and set the timestamps
    if (!appDetails.secretTimestamp && !appDetails.apiKeyTimestamp) {
      const [apiKeyRes, secretRes] = await Promise.all([
        starbaseClient.rotateApiKey.mutate({ clientId }),
        starbaseClient.rotateClientSecret.mutate({
          clientId,
        }),
      ])

      rotationResult = {
        rotatedApiKey: apiKeyRes.apiKey,
        rotatedClientSecret: secretRes.secret,
      }

      // This is a client 'hack' as the date
      // is populated from the graph
      // on subsequent requests
      appDetails.secretTimestamp = appDetails.apiKeyTimestamp = Date.now()
    }

    return json<LoaderData>({
      apps: reshapedApps,
      avatarUrl,
      appDetails: appDetails as appDetailsProps,
      rotationResult,
    })
  } catch (error) {
    console.error('Caught error in loader', { error })
    if (error instanceof Response) {
      throw error
    } else throw json({ error }, { status: 500 })
  }
}

// Component
// -----------------------------------------------------------------------------

export default function AppDetailIndexPage() {
  const loaderData = useLoaderData<LoaderData>()

  const { profileURL } = useOutletContext<{ profileURL: string }>()

  const { apps, avatarUrl } = loaderData
  const { appDetails, rotationResult } = loaderData

  const notify = (success: boolean = true) => {
    if (success) {
      toast.success('Saved', { duration: 2000 })
    } else {
      toast.error(
        'Could not save your changes due to errors noted on the page',
        {
          duration: 2000,
        }
      )
    }
  }

  return (
    <div className="flex flex-col md:flex-row min-h-full">
      <SiteMenu apps={apps} selected={appDetails.clientId} />
      <main className="flex flex-col flex-initial min-h-full w-full bg-gray-50">
        <SiteHeader avatarUrl={avatarUrl} profileURL={profileURL} />
        <Toaster position="top-right" reverseOrder={false} />
        <section className="mx-11 my-9">
          <Outlet
            context={{
              notificationHandler: notify,
              appDetails,
              rotationResult,
            }}
          />
        </section>
      </main>
    </div>
  )
}
