import { Button, Text } from '@proofzero/design-system'
import { useState } from 'react'
import { DeleteAppModal } from '../DeleteAppModal/DeleteAppModal'

import {
  ApplicationListItem,
  ApplicationListItemPublishedState,
} from './ApplicationListItem'

import type { ApplicationListItemProps } from './ApplicationListItem'
import _ from 'lodash'
import { DangerPill } from '@proofzero/design-system/src/atoms/pills/DangerPill'
import { Link } from '@remix-run/react'
import classNames from 'classnames'

type ApplicationListProps = {
  applications: ApplicationListItemProps[]
  onCreate: () => void
  navigate: (clientId: string) => void
  transfer: (clientId: string) => void
  lite?: boolean
}

export const ApplicationList = ({
  applications,
  onCreate,
  navigate,
  transfer,
  lite = false,
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

  const groupedAppsByGroupID = _.groupBy(groupApps, 'groupID')
  const groupedApplications = _.mapValues(groupedAppsByGroupID, (apps) => {
    return {
      groupName: apps[0].groupName,
      groupPaymentFailed: apps[0].groupPaymentFailed,
      apps,
    }
  })

  return (
    <div>
      {!lite && (
        <section className="flex justify-between items-start">
          <Text size="base" weight="semibold" className="text-gray-900">
            Your Applications
          </Text>

          <Button btnType="primary-alt" onClick={onCreate}>
            Create Application
          </Button>
        </section>
      )}

      {!lite && (
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
      )}

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

        <div className="flex flex-col space-y-2">
          {ownApps.map((ali) => (
            <ApplicationListItem
              key={ali.id}
              navigate={navigate}
              transfer={transfer}
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
        </div>

        {Object.entries(groupedApplications).map(([groupID, entry]) => (
          <section
            key={groupID}
            className={classNames('flex flex-col space-y-2', {
              'mt-5': !lite,
            })}
          >
            {!lite && (
              <div className="flex mb-2 flex-row space-x-2 items-center">
                <Text size="sm" weight="medium" className="text-gray-500">
                  {entry.groupName}
                </Text>

                {entry.groupPaymentFailed && (
                  <Link to={`/billing/groups/${groupID}`}>
                    <DangerPill text="Update Payment Information" />
                  </Link>
                )}
              </div>
            )}

            {entry.apps.map((ali) => (
              <ApplicationListItem
                key={ali.id}
                navigate={navigate}
                transfer={transfer}
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
