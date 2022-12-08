/**
 * @file app/routes/dashboard/index.tsx
 */

import { useOutletContext } from '@remix-run/react'

import AppBox from '~/components/AppBox'

import type { ContextType } from '../dashboard'

// Component
// -----------------------------------------------------------------------------

export default function DashboardIndexPage() {
  // We get the list of applications in a parent context and pass it down using
  // OutletContext (React Context).
  const { apps, appId } = useOutletContext<ContextType>()

  return (
    <div>
      <AppBox createLink="/dashboard/new" apps={apps} />
    </div>
  )
}
