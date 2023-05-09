import { Text } from '@proofzero/design-system'

import SectionTitle from '~/components/typography/sectionTitle'
import { AddressList } from '~/components/addresses/AddressList'

import { Link } from '@remix-run/react'

import dashboardChart from '~/assets/dashboard_chart.svg'
import type { AddressListItemProps } from '~/components/addresses/AddressListItem'
import { NestedErrorPage } from '@proofzero/design-system/src/pages/nested-error/NestedErrorPage'

import { useOutletContext } from '@remix-run/react'
import type { AddressURN } from '@proofzero/urns/address'
import { AuthorizedAppsModel } from '../settings'

export default function DashboardLayout() {
  const { connectedProfiles, authorizedApps, primaryAddressURN } =
    useOutletContext<{
      connectedProfiles: any[]
      authorizedApps: AuthorizedAppsModel[]
      primaryAddressURN: AddressURN
    }>()

  return (
    <div className="w-full h-full flex flex-col">
      <div className="pb-6">
        <Text weight="semibold" size="2xl">
          Dashboard
        </Text>
      </div>

      <div
        className="dashboard flex flex-col md:flex-row
    items-center md:items-start md:space-x-4
     h-full w-full"
      >
        <div className="flex flex-col gap-4 space-y-4 md:flex-1 w-full">
          <div>
            <SectionTitle title="Activity" />
            <div
              className="w-full h-[205px] border border-gray-200
              rounded-lg shadow flex justify-center items-center
              shadow-sm"
              style={{
                background: `url(${dashboardChart}), #FFFFFF`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'bottom',
                backgroundSize: 'contain',
              }}
            >
              <Text weight="medium" className="text-gray-400">
                Coming Soon
              </Text>
            </div>
          </div>

          <div className="">
            <div className="flex flex-row justify-between items-center">
              <SectionTitle title="Connected Accounts" />

              <Link className="mb-3" to="/settings/accounts">
                <Text
                  size="xs"
                  weight="medium"
                  className="text-indigo-500 cursor-pointer"
                >
                  Edit
                </Text>
              </Link>
            </div>

            <AddressList
              primaryAddressURN={primaryAddressURN}
              addresses={connectedProfiles as AddressListItemProps[]}
              showReconnectAccount={false}
            />
          </div>
        </div>
        <div className="flex flex-col md:flex-1 h-full w-full">
          <SectionTitle title="Applications" />
          {authorizedApps.length === 0 ? (
            <NestedErrorPage text={'No Application Available'} />
          ) : (
            <div
              className="border bg-white shadow-sm flex-1 flex flex-col
             rounded-lg mb-4 sm:mb-0"
            >
              <div className="bg-[#F9FAFB] flex items-center py-5 px-8 rounded-t-lg">
                <Text
                  size="sm"
                  weight="medium"
                  className="text-gray-500 flex-1"
                >
                  APPLICATION
                </Text>
                <Text
                  size="sm"
                  weight="medium"
                  className="text-gray-500 flex-1"
                >
                  AUTHORIZED
                </Text>
              </div>

              <div className="flex flex-1 flex-col">
                {authorizedApps.map(
                  (a: { icon: string; title: string; timestamp: number }) => (
                    <article
                      key={a.title}
                      className="flex items-center py-5 px-8"
                    >
                      <div className="flex-1 flex flex-row items-center space-x-4">
                        <img
                          src={a.icon}
                          alt="app icon"
                          className="object-cover w-6 h-6 rounded"
                        />

                        <Text
                          size="sm"
                          weight="medium"
                          className="text-gray-500 flex-1"
                        >
                          {a.title}
                        </Text>
                      </div>

                      <Text
                        size="sm"
                        weight="medium"
                        className="text-gray-500 flex-1"
                      >
                        {new Date(a.timestamp).toLocaleString('default', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </Text>
                    </article>
                  )
                )}
              </div>

              <div className="w-full px-8">
                <div className="border-t border-gray-200"></div>
              </div>

              <div className="flex flex-row justify-center">
                <Link to="/settings/applications">
                  <Text
                    size="sm"
                    weight="medium"
                    className="cursor-pointer text-indigo-500 hover:underline my-4"
                  >
                    View All
                  </Text>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
