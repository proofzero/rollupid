import { useEffect, useState } from 'react'

import {
  useFetcher,
  useLoaderData,
  useNavigate,
  useOutletContext,
} from '@remix-run/react'
import { json } from '@remix-run/cloudflare'

import { Text } from '@proofzero/design-system/src/atoms/text/Text'
import { Button } from '@proofzero/design-system/src/atoms/buttons/Button'
import { toast, ToastType } from '@proofzero/design-system/src/atoms/toast'
import { NestedErrorPage } from '@proofzero/design-system/src/pages/nested-error/NestedErrorPage'

import {
  getFlashSession,
  commitFlashSession,
  getValidatedSessionContext,
} from '~/session.server'

import type { LoaderFunction } from '@remix-run/cloudflare'
import { AuthorizedAppsModel } from '~/routes/settings'
import { WarningCTA } from '@proofzero/design-system/src/molecules/cta/warning'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    await getValidatedSessionContext(
      request,
      context.authzQueryParams,
      context.env,
      context.traceSpan
    )
    const session = await getFlashSession(request, context.env)

    const sessionTooltipMessage = session.get('tooltipMessage')
    const tooltipMessage = sessionTooltipMessage
      ? JSON.parse(sessionTooltipMessage)
      : undefined

    return json(
      {
        tooltipMessage,
      },
      {
        headers: {
          'Set-Cookie': await commitFlashSession(request, context.env, session),
        },
      }
    )
  }
)

const AppListItem = ({
  app,
  setSelectedApp,
}: {
  app: AuthorizedAppsModel
  setSelectedApp: (app: AuthorizedAppsModel) => void
}) => {
  const [approvedDateTime, setApprovedDateTime] = useState<undefined | string>()

  useEffect(() => {
    setApprovedDateTime(
      new Date(app.timestamp).toLocaleString('default', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    )
  }, [app])
  return (
    <article
      className="flex-1 flex flex-row px-5 py-4 space-x-4 rounded-lg
    border shadow-sm items-center bg-white"
    >
      {/* App icon is changed only when there is an error with data, not scopes */}
      {app.appDataError ? (
        <div
          className="w-16 h-16 flex items-center justify-center bg-[#F3F4F6]
         rounded-lg"
        >
          <img
            src={app.icon}
            alt="Not found"
            className="object-cover w-8 h-8 rounded"
          />
        </div>
      ) : (
        <img
          src={app.icon}
          alt="Not found"
          className="object-cover w-16 h-16 rounded"
        />
      )}

      <div className="flex-1 flex flex-col space-y-2">
        <div className="flex-1 flex flex-row space-x-2 items-center">
          {app.title ? (
            <Text
              weight="semibold"
              size="base"
              className="text-gray-900 w-fit py-[2px]"
            >
              {app.title}
            </Text>
          ) : null}
          {app.appDataError || app.appScopeError ? (
            <Text
              size="sm"
              className="text-[#EA580C] bg-orange-50 rounded-xl w-fit px-2 py-[2px]"
            >
              Data Error
            </Text>
          ) : null}
        </div>

        <Text size="xs" weight="normal" className="text-gray-500">
          Approved: {approvedDateTime}
        </Text>
      </div>

      <div className="text-right">
        <Button
          btnType="secondary-alt"
          className="bg-white hover:bg-gray-50"
          onClick={() => {
            setSelectedApp(app)
          }}
        >
          Edit Access
        </Button>
      </div>
    </article>
  )
}

export default function ApplicationsLayout() {
  const { tooltipMessage } = useLoaderData<{
    tooltipMessage?: {
      type: string
      message: string
    }
  }>()

  const { authorizedApps } = useOutletContext<{
    authorizedApps: AuthorizedAppsModel[]
  }>()

  const [selectedApp, setSelectedApp] = useState<
    undefined | AuthorizedAppsModel
  >()

  const fetcher = useFetcher()

  useEffect(() => {
    if (fetcher.state === 'submitting' && fetcher.type === 'actionSubmission') {
      setSelectedApp(undefined)
    }

    if (fetcher.type === 'actionReload') {
      fetcher.load('/account/applications')
    }
  }, [fetcher])

  useEffect(() => {
    if (tooltipMessage) {
      switch (tooltipMessage.type) {
        case 'success':
          toast(ToastType.Success, { message: tooltipMessage.message })
          break
        case 'error':
          toast(ToastType.Error, { message: tooltipMessage.message })
          break
        default:
          toast(ToastType.Info, { message: tooltipMessage.message })
      }
    }
  }, [tooltipMessage])

  const navigate = useNavigate()
  useEffect(() => {
    if (selectedApp) {
      navigate(`/settings/applications/${selectedApp.clientId}`)
    }
  }, [selectedApp])

  const appErrorExists = authorizedApps.some(
    (app) => app.appDataError || app.appScopeError
  )

  return (
    <>
      <Text size="2xl" weight="semibold" className="text-gray-800 mb-6">
        Applications
      </Text>
      {appErrorExists ? (
        <WarningCTA
          description="We detected a data error in your application(s).
      Please revoke the authorization and re-authorize again in the affected application."
        />
      ) : null}

      {authorizedApps.length === 0 ? (
        <section className="h-[512px] sm:h-[256px]">
          <NestedErrorPage text={'No applications found'} />
        </section>
      ) : (
        <section className="flex flex-col space-y-4">
          {authorizedApps.map((a, i) => (
            <AppListItem key={i} app={a} setSelectedApp={setSelectedApp} />
          ))}
        </section>
      )}
    </>
  )
}
