import { useLoaderData } from '@remix-run/react'
import { loader as appLoader } from '~/routes/api/apps/index'
import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import { Button } from '@kubelt/design-system/src/atoms/buttons/Button'
import { Modal } from '@kubelt/design-system/src/molecules/modal/Modal'
import { useState } from 'react'

export const loader = appLoader

const RevocationModal = ({
  isOpen,
  setIsOpen,
  icon,
  title,
}: {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  icon: string
  title: string
}) => (
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

      <div className="flex justify-end items-center space-x-3 mt-20">
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

export default () => {
  const { apps } = useLoaderData<{
    apps: {
      icon: string
      title: string
      timestamp: number
    }[]
  }>()

  const [selectedApp, setSelectedApp] = useState<
    | undefined
    | {
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
            className="flex-1 flex flex-row px-5 py-4 space-x-4 rounded-lg border"
          >
            <img src={a.icon} className="object-cover w-16 h-16 rounded" />

            <div className="flex-1">
              <Text weight="semibold" className="text-gray-900">
                {a.title}
              </Text>
            </div>

            <div className="text-right">
              <Button
                btnType="secondary-alt"
                className="bg-gray-100 mb-4"
                onClick={() => {
                  setSelectedApp(a)
                  setRevocationModalOpen(true)
                }}
              >
                Edit Access
              </Button>

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
          </article>
        ))}
      </section>
    </>
  )
}
