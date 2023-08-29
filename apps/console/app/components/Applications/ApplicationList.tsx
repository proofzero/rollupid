import { Button, Text } from '@proofzero/design-system'
import { useState } from 'react'
import { DeleteAppModal } from '../DeleteAppModal/DeleteAppModal'

import {
  ApplicationListItem,
  ApplicationListItemPublishedState,
} from './ApplicationListItem'

import type { ApplicationListItemProps } from './ApplicationListItem'

type ApplicationListProps = {
  applications: ApplicationListItemProps[]
  onCreate: () => void
  navigate: (clientId: string) => void
}

export const ApplicationList = ({
  applications,
  onCreate,
  navigate,
}: ApplicationListProps) => {
  const [actionApp, setActionApp] = useState<
    | {
        clientId: string
        name: string
        hasCustomDomain: boolean
      }
    | undefined
  >()
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  const ownApps = applications.filter((a) => !a.groupID && !a.groupName)
  const groupApps = applications.filter((a) => a.groupID && a.groupName)

  const groupedApplications = groupApps.reduce(
    (acc, app) => {
      const { groupName, groupID } = app
      if (!acc[groupID!]) {
        acc[groupID!] = {
          groupName: groupName!,
          apps: [],
        }
      }

      acc[groupID!].apps.push(app)

      return acc
    },
    {} as Record<
      string,
      {
        groupName: string
        apps: ApplicationListItemProps[]
      }
    >
  )

  return (
    <div>
      <section className="flex justify-between items-start">
        <Text size="base" weight="semibold" className="text-gray-900">
          Your Applications
        </Text>

        <Button btnType="primary-alt" onClick={onCreate}>
          Create Application
        </Button>
      </section>

      <section className="flex space-x-4 my-4">
        <div className="flex space-x-2 items-center">
          <ApplicationListItemPublishedState published={true} />
          <Text size="xs" weight="normal" className="text-gray-500">
            Published
          </Text>
        </div>

        <div className="flex space-x-2 items-center">
          <ApplicationListItemPublishedState published={false} />
          <Text size="xs" weight="normal" className="text-gray-500">
            Unpublished
          </Text>
        </div>
      </section>

      <section className="flex flex-col">
        {actionApp && (
          <DeleteAppModal
            isOpen={deleteModalOpen}
            deleteAppCallback={() => {
              setDeleteModalOpen(false)
            }}
            appClientID={actionApp?.clientId}
            appName={actionApp?.name}
            appHasCustomDomain={actionApp?.hasCustomDomain}
          />
        )}

        {ownApps.map((ali) => (
          <ApplicationListItem
            key={ali.id}
            navigate={navigate}
            {...ali}
            onDeleteApplication={(clientId, appName, hasCustomDomain) => {
              setActionApp({
                clientId,
                name: appName,
                hasCustomDomain,
              })
              setDeleteModalOpen(true)
            }}
          />
        ))}

        {Object.entries(groupedApplications).map(([groupID, entry]) => (
          <section key={groupID} className="flex flex-col space-y-2 mt-5">
            <Text size="sm" weight="medium" className="text-gray-500 mb-2">
              {entry.groupName}
            </Text>

            {entry.apps.map((ali) => (
              <ApplicationListItem
                key={ali.id}
                navigate={navigate}
                {...ali}
                onDeleteApplication={(clientId, appName, hasCustomDomain) => {
                  setActionApp({
                    clientId,
                    name: appName,
                    hasCustomDomain,
                  })
                  setDeleteModalOpen(true)
                }}
              />
            ))}
          </section>
        ))}
      </section>
    </div>
  )
}
