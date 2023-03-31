/**
 * @file app/routes/dashboard/index.tsx
 */

import { useNavigate, useOutletContext } from '@remix-run/react'

import folderPlus from '~/images/folderPlus.svg'

import { Button } from '@proofzero/design-system/src/atoms/buttons/Button'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'

//import { useUser } from "~/utils";

import SiteMenu from '~/components/SiteMenu'
import SiteHeader from '~/components/SiteHeader'

import AppBox from '~/components/AppBox'
import { Popover } from '@headlessui/react'
import { InfoPanelDashboard } from '~/components/InfoPanel/InfoPanelDashboard'

import type { LoaderData as OutletContextData } from '~/root'

// Component
// -----------------------------------------------------------------------------

export default function DashboardIndexPage() {
  const { apps, avatarUrl, PASSPORT_URL, displayName } =
    useOutletContext<OutletContextData>()

  const navigate = useNavigate()

  return (
    <Popover className="min-h-screen relative">
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
                    max-lg:h-[calc(100vh-80px)]\
                    min-h-[635px]'
                  : 'h-full'
              }} bg-gray-50 p-6 h-full`}
            >
              <div className="mb-11">
                <InfoPanelDashboard />
              </div>

              {apps?.length > 0 && (
                <AppBox createLink="/dashboard/new" apps={apps} />
              )}

              {apps?.length === 0 && (
                <>
                  <Text
                    size="base"
                    weight="semibold"
                    className="text-gray-900 mb-6"
                  >
                    Your Applications
                  </Text>

                  <div className="text-center m-auto">
                    <img
                      className="inline-block mb-2"
                      src={folderPlus}
                      alt="Wallet icon"
                    />

                    <Text weight="semibold" className="text-gray-900">
                      No Applications
                    </Text>
                    <Text weight="medium" className="text-gray-500 mb-6">
                      Get started by creating an Application.
                    </Text>

                    <Button
                      btnType="primary-alt"
                      btnSize="l"
                      onClick={() => {
                        navigate('/apps/new')
                      }}
                    >
                      Create Application
                    </Button>
                  </div>
                </>
              )}
            </div>
          </main>
        </div>
      )}
    </Popover>
  )
}
