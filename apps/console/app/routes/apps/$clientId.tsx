import type { LoaderFunction } from '@remix-run/cloudflare'

import { Outlet, useLoaderData, useOutletContext } from '@remix-run/react'
import { json } from '@remix-run/cloudflare'

import SiteMenu from '~/components/SiteMenu'
import SiteHeader from '~/components/SiteHeader'

import { requireJWT } from '~/utilities/session.server'
import { getGalaxyClient } from '~/utilities/platform.server'
import createStarbaseClient from '@proofzero/platform-clients/starbase'
import type { appDetailsProps } from '~/types'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import type { RotatedSecrets } from '~/types'
import {
  toast,
  Toaster,
  ToastType,
} from '@proofzero/design-system/src/atoms/toast'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'

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
  PASSPORT_URL: string
}

export const loader: LoaderFunction = async ({ request, params, context }) => {
  if (!params.clientId) {
    throw new Error('Client ID is required for the requested route')
  }

  const jwt = await requireJWT(request)
  const traceHeader = generateTraceContextHeaders(context.traceSpan)
  const galaxyClient = await getGalaxyClient(traceHeader)

  const clientId = params?.clientId

  try {
    const starbaseClient = createStarbaseClient(Starbase, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })
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
      PASSPORT_URL,
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

  const { apps, avatarUrl, PASSPORT_URL } = loaderData
  const { appDetails, rotationResult } = loaderData

  const notify = (success: boolean = true) => {
    if (success) {
      toast(ToastType.Success, { message: 'Saved' }, { duration: 2000 })
    } else {
      toast(
        ToastType.Error,
        {
          message:
            'Could not save your changes due to errors noted on the page',
        },
        { duration: 2000 }
      )
    }
  }

  return (
    <div className="flex flex-col md:flex-row min-h-full bg-gray-50">
      <SiteMenu
        apps={apps}
        selected={appDetails.clientId}
        PASSPORT_URL={PASSPORT_URL}
      />
      <main className="flex flex-col flex-initial min-h-full w-full">
        <SiteHeader avatarUrl={avatarUrl} profileURL={profileURL} />
        <Toaster position="top-right" reverseOrder={false} />
        <section className="sm:mx-11 my-9">
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
