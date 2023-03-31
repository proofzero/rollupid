import type { LoaderFunction } from '@remix-run/cloudflare'

import { Outlet, useLoaderData, useOutletContext } from '@remix-run/react'
import { json } from '@remix-run/cloudflare'

import SiteMenu from '~/components/SiteMenu'
import SiteHeader from '~/components/SiteHeader'

import { requireJWT } from '~/utilities/session.server'
import createStarbaseClient from '@proofzero/platform-clients/starbase'
import type { appDetailsProps } from '~/types'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { Popover } from '@headlessui/react'

import type { RotatedSecrets } from '~/types'
import {
  toast,
  Toaster,
  ToastType,
} from '@proofzero/design-system/src/atoms/toast'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import type { LoaderData as OutletContextData } from '~/root'

type LoaderData = {
  appDetails: appDetailsProps
  rotationResult?: RotatedSecrets
}

export const loader: LoaderFunction = async ({ request, params, context }) => {
  if (!params.clientId) {
    throw new Error('Client ID is required for the requested route')
  }

  const jwt = await requireJWT(request)
  const traceHeader = generateTraceContextHeaders(context.traceSpan)
  const clientId = params?.clientId

  try {
    const starbaseClient = createStarbaseClient(Starbase, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

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

  const { apps, avatarUrl, PASSPORT_URL, displayName } =
    useOutletContext<OutletContextData>()
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
    <Popover className="min-h-screen relative">
      {({ open }) => (
        <div className="flex flex-col relative lg:flex-row min-h-full bg-gray-50">
          <SiteMenu
            apps={apps}
            open={open}
            selected={appDetails.clientId}
            PASSPORT_URL={PASSPORT_URL}
            displayName={displayName}
            pfpUrl={avatarUrl}
          />
          <main className="flex flex-col flex-initial min-h-full w-full">
            <SiteHeader avatarUrl={avatarUrl} />
            <Toaster position="top-right" reverseOrder={false} />

            <section
              className={`${
                open
                  ? 'max-lg:opacity-50\
                    max-lg:overflow-hidden\
                    max-lg:h-[calc(100vh-80px)]\
                    min-h-[636px]'
                  : 'h-full '
              } py-9 sm:mx-11`}
            >
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
      )}
    </Popover>
  )
}
