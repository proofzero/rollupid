import { useFetcher, useLoaderData } from '@remix-run/react'
import type { FetcherWithComponents } from '@remix-run/react'
import { loader as appLoader } from '~/routes/api/apps/index'
import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import { Button } from '@kubelt/design-system/src/atoms/buttons/Button'
import { Modal } from '@kubelt/design-system/src/molecules/modal/Modal'
import { useEffect, useState } from 'react'
import { Pill } from '@kubelt/design-system/src/atoms/pills/Pill'
import { json } from '@remix-run/cloudflare'
import type { LoaderFunction } from '@remix-run/cloudflare'
import { commitProfileSession, getProfileSession } from '~/utils/session.server'
import { toast } from 'react-hot-toast'

export const loader: LoaderFunction = async (args) => {
  const session = await getProfileSession(args.request)
  const { apps } = await appLoader(args)

  const currentClientId = PROFILE_CLIENT_ID

  const sessionTooltipMessage = session.get('tooltipMessage')
  const tooltipMessage = sessionTooltipMessage
    ? JSON.parse(sessionTooltipMessage)
    : undefined

  return json(
    {
      apps,
      currentClientId,
      tooltipMessage,
    },
    {
      headers: {
        'Set-Cookie': await commitProfileSession(session),
      },
    }
  )
}

const RevocationModal = ({
  isOpen,
  setIsOpen,
  clientId,
  currentClientId,
  icon,
  title,
  fetcher,
}: {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  clientId: string
  currentClientId: string
  icon: string
  title: string
  fetcher: FetcherWithComponents<any>
}) => {
  const localFetcher = useFetcher()

  useEffect(() => {
    localFetcher.load(`/api/apps/${clientId}/scopes`)
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
            action={`/account/applications/${clientId}/revoke`}
            method="post"
          >
            <Button
              type="submit"
              btnType="dangerous-alt"
              disabled={clientId === currentClientId}
            >
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
    <article className="flex-1 flex flex-row px-5 py-4 space-x-4 rounded-lg border items-center">
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
          className="bg-gray-100"
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

export default () => {
  const { apps, currentClientId, tooltipMessage } = useLoaderData<{
    apps: App[]
    currentClientId: string
    tooltipMessage: undefined | { type: 'success' | 'error'; message: string }
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
          toast.success(tooltipMessage.message)
          break
        case 'error':
          toast.error(tooltipMessage.message)
          break
        default:
          toast(tooltipMessage.message)
      }
    }
  }, [tooltipMessage])

  return (
    <>
      <Text size="xl" weight="semibold" className="text-gray-800 mb-5">
        Applications
      </Text>

      {selectedApp && (
        <>
          <RevocationModal
            clientId={selectedApp.clientId}
            currentClientId={currentClientId}
            icon={selectedApp.icon}
            title={selectedApp.title}
            fetcher={fetcher}
            isOpen={revocationModalOpen}
            setIsOpen={setRevocationModalOpen}
          />
        </>
      )}

      <section className="flex flex-col space-y-4">
        {apps.map((a, i) => (
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
