/**
 * @file app/shared/components/AppList/index.tsx
 */

// TODO migrate to FolderPlusIcon and remove bespoke version
import { type ServicePlanType } from '@proofzero/types/account'
import { ApplicationList } from '../Applications/ApplicationList'

// AppBox
// -----------------------------------------------------------------------------

type AppBoxProps = {
  // Application model instances
  apps: {
    clientId: string
    name?: string
    published?: boolean
    createdTimestamp?: number
    icon?: string
    hasCustomDomain: boolean
    appPlan: ServicePlanType
  }[]
  // Link target for creating a new application.
  createLink: string
  onCreate: () => void
  navigate: (clientId: string) => void
}

export default function AppBox(props: AppBoxProps) {
  // TODO: Get more app details here...
  const mappedApps = props.apps.map((app) => ({
    id: app.clientId,
    name: app.name,
    createdTimestamp: app.createdTimestamp,
    published: app.published,
    icon: app.icon,
    hasCustomDomain: app.hasCustomDomain,
    appPlan: app.appPlan,
  }))

  return (
    <div className="mt-8">
      <ApplicationList
        applications={mappedApps}
        onCreate={props.onCreate}
        navigate={props.navigate}
      />
    </div>
  )
}
