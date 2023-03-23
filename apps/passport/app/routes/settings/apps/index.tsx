import { useEffect, useState } from 'react'

import { useFetcher, useLoaderData, useOutletContext } from '@remix-run/react'
import { json } from '@remix-run/cloudflare'

import { Text } from '@proofzero/design-system/src/atoms/text/Text'
import { Button } from '@proofzero/design-system/src/atoms/buttons/Button'
import { Modal } from '@proofzero/design-system/src/molecules/modal/Modal'
import { Pill } from '@proofzero/design-system/src/atoms/pills/Pill'
import { toast, ToastType } from '@proofzero/design-system/src/atoms/toast'

import { getFlashSession, commitFlashSession } from '~/session.server'

import type { LoaderFunction } from '@remix-run/cloudflare'
import type { FetcherWithComponents } from '@remix-run/react'

export const loader: LoaderFunction = async ({ request, context }) => {
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
        'Set-Cookie': await commitFlashSession(context.env, session),
      },
    }
  )
}

const RevocationModal = ({
  isOpen,
  setIsOpen,
  clientId,
  icon,
  title,
  fetcher,
}: {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  clientId: string
  icon: string
  title: string
  fetcher: FetcherWithComponents<any>
}) => {
  const localFetcher = useFetcher()

  useEffect(() => {
    localFetcher.load(`/settings/apps/${clientId}/scopes`)
  }, [clientId])

  return (
    <Modal isOpen={isOpen} handleClose={() => setIsOpen(false)}>
      <div
        className={`min-w-[330px] sm:min-w-[620px] md:min-w-[700px] lg:min-w-[908px]
         relative transform rounded-lg bg-white px-4 pt-5 pb-4 text-left
        shadow-xl transition-all sm:p-6 overflow-y-auto`}
      >
        <div className="flex flex-row space-x-6 items-center">
          <img
            src={icon}
            className="object-cover w-16 h-16 rounded"
            alt="Not found"
          />

          <Text weight="semibold" className="text-gray-900">
            {title}
          </Text>
        </div>

        {localFetcher.data && (
          <div className="my-5">
            {localFetcher.data.map(
              (scope: { permission: string; scopes: string[] }, i: number) => (
                <div
                  key={`${scope.permission}-${i}`}
                  className={`flex flex-row space-x-2 items-center py-5 border-b ${
                    i === 0 ? 'border-t' : ''
                  }`}
                >
                  <Text size="sm" weight="normal" className="text-gray-500">
                    {scope.permission}:
                  </Text>

                  {scope.scopes.map((s, i) => (
                    <Pill key={`${s}-${i}`} className="bg-[#F2F4F7]">
                      <Text size="xs" weight="medium" className="text-gray-500">
                        {s}
                      </Text>
                    </Pill>
                  ))}
                </div>
              )
            )}
          </div>
        )}

        <div className="flex justify-end items-center space-x-3">
          <Button
            btnType="secondary-alt"
            onClick={() => setIsOpen(false)}
            className="bg-gray-100"
          >
            Cancel
          </Button>

          <fetcher.Form
            action={`/settings/apps/${clientId}/revoke`}
            method="post"
          >
            <Button type="submit" btnType="dangerous-alt">
              Revoke Access
            </Button>
          </fetcher.Form>
        </div>
      </div>
    </Modal>
  )
}

type App = {
  clientId: string
  icon: string
  title: string
  timestamp: number
}
const AppListItem = ({
  app,
  setSelectedApp,
  setRevocationModalOpen,
}: {
  app: App
  setSelectedApp: (app: App) => void
  setRevocationModalOpen: (val: boolean) => void
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
    <article className="flex-1 flex flex-row px-5 py-4 space-x-4 rounded-lg border items-center bg-white">
      <img
        src={app.icon}
        alt="Not found"
        className="object-cover w-16 h-16 rounded"
      />

      <div className="flex-1 flex flex-col space-y-2">
        <Text weight="semibold" className="text-gray-900">
          {app.title}
        </Text>

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
            setRevocationModalOpen(true)
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
    authorizedApps: any[]
  }>()

  const [selectedApp, setSelectedApp] = useState<undefined | App>()

  const [revocationModalOpen, setRevocationModalOpen] = useState(false)

  const fetcher = useFetcher()

  useEffect(() => {
    if (fetcher.state === 'submitting' && fetcher.type === 'actionSubmission') {
      setRevocationModalOpen(false)
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
  return (
    <>
      <Text size="2xl" weight="semibold" className="text-gray-800 mb-6">
        Applications
      </Text>

      {selectedApp && (
        <>
          <RevocationModal
            clientId={selectedApp.clientId}
            icon={selectedApp.icon}
            title={selectedApp.title}
            fetcher={fetcher}
            isOpen={revocationModalOpen}
            setIsOpen={setRevocationModalOpen}
          />
        </>
      )}

      <section className="flex flex-col space-y-4">
        {authorizedApps.map((a, i) => (
          <AppListItem
            key={i}
            app={a}
            setSelectedApp={setSelectedApp}
            setRevocationModalOpen={setRevocationModalOpen}
          />
        ))}
      </section>
    </>
  )
}
