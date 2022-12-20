/**
 * @file app/shared/components/AppList/index.tsx
 */

import { useState } from 'react'

import type { Application } from '~/models/app.server'

// TODO migrate to FolderPlusIcon and remove bespoke version
import { ApplicationList } from '../Applications/ApplicationList'
import { NewAppModal } from '../NewAppModal/NewAppModal'

// LegendItem
// -----------------------------------------------------------------------------

type LegendItemProps = {
  label: string
  color: string
}

function LegendItem(props: LegendItemProps) {
  return (
    <span className="inline-flex items-center px-3 py-0.5 text-sm font-medium text-gray-500">
      <svg className={`-ml-1 mr-1.5 h-2 w-2 ${props.color}`} viewBox="0 0 8 8">
        <circle cx={4} cy={4} r={4} />
      </svg>
      {props.label}
    </span>
  )
}

// AppBox
// -----------------------------------------------------------------------------

type AppBoxProps = {
  // Application model instances
  apps: Array<Application>
  // Link target for creating a new application.
  createLink: string
}

export default function AppBox(props: AppBoxProps) {
  const [newAppModalOpen, setNewAppModalOpen] = useState(false)

  // TODO: Get more app details here...
  const mappedApps = props.apps.map((appURN) => ({
    id: appURN.split('/')[1],
    created: new Date(),
    title: "Foo",
    published: false,
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
