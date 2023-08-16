import type { LoaderFunction } from '@remix-run/cloudflare'

import { Outlet, useLoaderData, useOutletContext } from '@remix-run/react'
import { json } from '@remix-run/cloudflare'

import SiteMenu from '~/components/SiteMenu'
import SiteHeader from '~/components/SiteHeader'

import { commitFlashSession, requireJWT } from '~/utilities/session.server'
import createCoreClient from '@proofzero/platform-clients/core'
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
import type { AccountURN } from '@proofzero/urns/account'
import type { PaymasterType } from '@proofzero/platform/starbase/src/jsonrpc/validators/app'
import { BadRequestError, NotFoundError } from '@proofzero/errors'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { PlatformAccountURNHeader } from '@proofzero/types/headers'
import { getToastsAndFlashSession } from '~/utils/toast.server'
import { useEffect } from 'react'
import { ToastWithLink } from '@proofzero/design-system/src/atoms/toast/ToastWithLink'

type LoaderData = {
  appDetails: appDetailsProps
  rotationResult?: RotatedSecrets
  appContactAddress?: AccountURN
  appContactEmail?: string
  paymaster: PaymasterType
  toasts: {
    message: string
    type: ToastType
  }[]
}

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, params, context }) => {
    if (!params.clientId) {
      throw new BadRequestError({
        message: 'Client ID is required for the requested route',
      })
    }

    const jwt = await requireJWT(request, context.env)
    const traceHeader = generateTraceContextHeaders(context.traceSpan)
    const clientId = params?.clientId

    try {
      const coreClient = createCoreClient(context.env.Core, {
        ...getAuthzHeaderConditionallyFromToken(jwt),
        ...traceHeader,
      })

      const appDetails = await coreClient.starbase.getAppDetails.query({
        clientId: clientId as string,
      })

      const paymaster = await coreClient.starbase.getPaymaster.query({
        clientId: clientId as string,
      })

      let rotationResult
      //If there's no timestamps, then the secrets have never been set, signifying the app
      //has just been created; we rotate both secrets and set the timestamps
      if (!appDetails.secretTimestamp && !appDetails.apiKeyTimestamp) {
        const [apiKeyRes, secretRes] = await Promise.all([
          coreClient.starbase.rotateApiKey.mutate({ clientId }),
          coreClient.starbase.rotateClientSecret.mutate({
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

      const appContactAddress =
        await coreClient.starbase.getAppContactAddress.query({
          clientId: params.clientId,
        })

      let appContactEmail
      if (appContactAddress) {
        const coreClient = createCoreClient(context.env.Core, {
          [PlatformAccountURNHeader]: appContactAddress,
          ...getAuthzHeaderConditionallyFromToken(jwt),
          ...generateTraceContextHeaders(context.traceSpan),
        })

        const { address } = await coreClient.account.getAccountProfile.query()
        appContactEmail = address
      }

      const { flashSession, toasts } = await getToastsAndFlashSession(
        request,
        context.env
      )

      return json<LoaderData>(
        {
          appDetails: appDetails as appDetailsProps,
          rotationResult,
          appContactAddress,
          appContactEmail,
          paymaster,
          toasts,
        },
        {
          headers: {
            'Set-Cookie': await commitFlashSession(flashSession, context.env),
          },
        }
      )
    } catch (error) {
      console.error('Caught error in loader', { error })
      if (error instanceof Response) {
        throw error
      } else
        throw new NotFoundError({
          message: `Request received for clientId ${clientId} which is not owned by provided identity`,
        })
    }
  }
)

// Component
// -----------------------------------------------------------------------------

export default function AppDetailIndexPage() {
  const loaderData = useLoaderData<LoaderData>()

  const {
    apps,
    avatarUrl,
    PASSPORT_URL,
    displayName,
    identityURN,
    hasUnpaidInvoices,
    unpaidInvoiceURL,
  } = useOutletContext<OutletContextData>()
  const {
    appDetails,
    rotationResult,
    appContactAddress,
    appContactEmail,
    paymaster,
    toasts,
  } = loaderData

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

  useEffect(() => {
    if (!toasts || !toasts.length) return

    for (const { type, message } of toasts) {
      toast(type, {
        message: message,
      })
    }
  }, [toasts])

  return (
    <Popover className="min-h-[100dvh] relative">
      {({ open }) => (
        <div className="flex flex-col relative lg:flex-row min-h-screen bg-gray-50">
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
            {hasUnpaidInvoices && (
              <ToastWithLink
                message="We couldn't process payment for your account"
                linkHref={unpaidInvoiceURL}
                linkText="Update payment information"
                type={'urgent'}
              />
            )}
            <Toaster position="top-right" reverseOrder={false} />

            <section
              className={`${
                open
                  ? 'max-lg:opacity-50\
                    max-lg:overflow-hidden\
                    max-lg:h-[calc(100dvh-80px)]\
                    min-h-[636px]'
                  : 'h-full '
              } py-9 sm:mx-11 max-w-[1636px]`}
            >
              <Outlet
                context={{
                  apps,
                  notificationHandler: notify,
                  appDetails,
                  avatarUrl,
                  rotationResult,
                  PASSPORT_URL,
                  appContactAddress,
                  appContactEmail,
                  paymaster,
                  identityURN,
                  hasUnpaidInvoices,
                }}
              />
            </section>
          </main>
        </div>
      )}
    </Popover>
  )
}
