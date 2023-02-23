import { useFetcher, useLoaderData } from '@remix-run/react'
import { loader as appLoader } from '~/routes/api/apps/index'
import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import { Button } from '@kubelt/design-system/src/atoms/buttons/Button'
import { Modal } from '@kubelt/design-system/src/molecules/modal/Modal'
import { useEffect, useState } from 'react'
import { Pill } from '@kubelt/design-system/src/atoms/pills/Pill'

export const loader = appLoader

const RevocationModal = ({
  isOpen,
  setIsOpen,
  clientId,
  icon,
  title,
}: {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  clientId: string
  icon: string
  title: string
}) => {
  const fetcher = useFetcher()

  useEffect(() => {
    fetcher.load(`/api/apps/${clientId}/scopes`)
  }, [clientId])

  return (
    <Modal isOpen={isOpen} handleClose={() => setIsOpen(false)}>
      <div
        className={`min-w-[908px] relative transform rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:p-6 overflow-y-auto`}
      >
        <div className="flex flex-row space-x-6 items-center">
          <img src={icon} className="object-cover w-16 h-16 rounded" />

          <Text weight="semibold" className="text-gray-900">
            {title}
          </Text>
        </div>

        {fetcher.data && (
          <div className="my-5">
            {fetcher.data.map(
              (scope: { permission: string; scopes: string[] }, i: number) => (
                <div
                  className={`flex flex-row space-x-2 items-center py-5 border-b ${
                    i === 0 ? 'border-t' : ''
                  }`}
                >
                  <Text size="sm" weight="normal" className="text-gray-500">
                    {scope.permission}:
                  </Text>

                  {scope.scopes.map((s) => (
                    <Pill className="bg-[#F2F4F7]">
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

          <Button type="submit" btnType="dangerous-alt" disabled>
            Remove All Access
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default () => {
  const { apps } = useLoaderData<{
    apps: {
      clientId: string
      icon: string
      title: string
      timestamp: number
    }[]
  }>()

  const [selectedApp, setSelectedApp] = useState<
    | undefined
    | {
        clientId: string
        icon: string
        title: string
        timestamp: number
      }
  >()

  const [revocationModalOpen, setRevocationModalOpen] = useState(false)

  return (
    <>
      <Text size="xl" weight="semibold" className="text-gray-800 mb-5">
        Applications
      </Text>

      {selectedApp && (
        <>
          <RevocationModal
            clientId={selectedApp.clientId}
            icon={selectedApp.icon}
            title={selectedApp.title}
            isOpen={revocationModalOpen}
            setIsOpen={setRevocationModalOpen}
          />
        </>
      )}

      <section className="flex flex-col space-y-4">
        {apps.map((a, i) => (
          <article
            key={i}
            className="flex-1 flex flex-row px-5 py-4 space-x-4 rounded-lg border items-center"
          >
            <img src={a.icon} className="object-cover w-16 h-16 rounded" />

            <div className="flex-1 flex flex-col space-y-2">
              <Text weight="semibold" className="text-gray-900">
                {a.title}
              </Text>

              <Text size="xs" weight="normal" className="text-gray-500">
                Approved:{' '}
                {new Date(a.timestamp).toLocaleString('default', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </Text>
            </div>

            <div className="text-right">
              <Button
                btnType="secondary-alt"
                className="bg-gray-100"
                onClick={() => {
                  setSelectedApp(a)
                  setRevocationModalOpen(true)
                }}
              >
                Edit Access
              </Button>
            </div>
          </article>
        ))}
      </section>
    </>
  )
}
