/**
 * @file app/routes/dashboard/index.tsx
 */

import { Outlet, useOutletContext } from '@remix-run/react'

import SiteMenu from '~/components/SiteMenu'
import SiteHeader from '~/components/SiteHeader'

import { Popover } from '@headlessui/react'

import type { LoaderData as OutletContextData } from '~/root'

// Component
// -----------------------------------------------------------------------------

export default function DashboardIndexPage() {
  const context = useOutletContext<OutletContextData>()
  const { apps, avatarUrl, displayName, PASSPORT_URL } = context

  return (
    <Popover className="min-h-[100dvh] relative">
      {({ open }) => (
        <div className="flex lg:flex-row h-full">
          <SiteMenu
            apps={apps}
            PASSPORT_URL={PASSPORT_URL}
            open={open}
            pfpUrl={avatarUrl}
            displayName={displayName}
          />
          <main className="flex flex-col flex-initial min-h-full w-full bg-white">
            <SiteHeader avatarUrl={avatarUrl} />
            <div
              className={`${
                open
                  ? 'max-lg:opacity-50\
                    max-lg:overflow-hidden\
                    max-lg:h-[calc(100dvh-80px)]\
                    min-h-[635px]'
                  : 'h-full'
              } bg-gray-50 p-6`}
            >
              <Outlet context={context} />
            </div>
          </main>
        </div>
      )}
    </Popover>
  )
}
