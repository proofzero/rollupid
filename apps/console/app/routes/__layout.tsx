/**
 * @file app/routes/dashboard/index.tsx
 */

import { Outlet, useOutletContext } from '@remix-run/react'

import SiteMenu from '~/components/SiteMenu'
import SiteHeader from '~/components/SiteHeader'

import { Popover } from '@headlessui/react'

import type { LoaderData as OutletContextData } from '~/root'
import { ToastWithLink } from '@proofzero/design-system/src/atoms/toast/ToastWithLink'
import { IdentityGroupURN } from '@proofzero/urns/identity-group'

// Component
// -----------------------------------------------------------------------------

export default function DashboardIndexPage() {
  const context = useOutletContext<
    OutletContextData & {
      nastyIG: IdentityGroupURN[]
    }
  >()
  const {
    apps,
    avatarUrl,
    displayName,
    PASSPORT_URL,
    hasUnpaidInvoices,
    unpaidInvoiceURL,
    nastyIG,
  } = context

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
            nastyIG={nastyIG}
          />
          <main className="flex flex-col flex-initial min-h-full w-full bg-white">
            <SiteHeader avatarUrl={avatarUrl} />
            {hasUnpaidInvoices && (
              <ToastWithLink
                message="We couldn't process payment for your account"
                linkHref={unpaidInvoiceURL}
                linkText="Update payment information"
                type={'urgent'}
              />
            )}
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
