/**
 * @file app/shared/components/AppList/index.tsx
 */

import { useState } from 'react'

// TODO migrate to FolderPlusIcon and remove bespoke version
import { ApplicationList } from '../Applications/ApplicationList'
import { NewAppModal } from '../NewAppModal/NewAppModal'

// AppBox
// -----------------------------------------------------------------------------

type AppBoxProps = {
  // Application model instances
  apps: {
    clientId: string
    name?: string
    published?: boolean
    icon?: string
  }[]
  // Link target for creating a new application.
  createLink: string
}

export default function AppBox(props: AppBoxProps) {
  const [newAppModalOpen, setNewAppModalOpen] = useState(false)

  // TODO: Get more app details here...
  const mappedApps = props.apps.map((app) => ({
    id: app.clientId,
    name: app.name,
    published: app.published,
    icon: app.icon,
  }))

  return (
    <div className="mt-8">
      <ApplicationList
        applications={mappedApps}
        onCreateApplication={() => {
          setNewAppModalOpen(true)
        }}
      />

      <NewAppModal
        isOpen={newAppModalOpen}
        newAppCreateCallback={(app) => {
          setNewAppModalOpen(false)
        }}
      />
    </div>
  )
}
