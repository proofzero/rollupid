import { Text } from '@proofzero/design-system'

import SectionTitle from '~/components/typography/sectionTitle'
import { AddressList } from '~/components/addresses/AddressList'

import { Link } from '@remix-run/react'

import dashboardChart from '~/assets/dashboard_chart.svg'
import type { AddressListItemProps } from '~/components/addresses/AddressListItem'

import { useOutletContext } from '@remix-run/react'
import { normalizeProfileToConnection } from '~/utils/profile'

export default function DashboardLayout() {
  const { connectedProfiles, authorizedApps } = useOutletContext<{
    connectedProfiles: any[]
    authorizedApps: any[]
  }>()

  const normalizedConnectedProfiles = connectedProfiles
    .map((p) => ({
      urn: p.urn,
      type: p.type,
      nodeType: p.nodeType,
      ...p?.profile,
    }))
    .map(normalizeProfileToConnection)

  return (
    <div className="px-2 sm:max-md:px-5 md:px-10 w-full h-full flex flex-col pb-5 md:pb-10">
      <div className="py-6">
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
              rounded-lg shadow flex justify-center items-center "
              style={{
                background: `url(${dashboardChart})`,
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
              addresses={normalizedConnectedProfiles as AddressListItemProps[]}
            />
          </div>
        </div>
        <div className="flex flex-col md:flex-1 h-full w-full">
          <SectionTitle title="Applications" />
          <div className="border bg-white shadow flex-1 flex flex-col rounded-lg mb-4 sm:mb-0">
            <div className="bg-[#F9FAFB] flex items-center py-5 px-8 rounded-t-lg">
              <Text size="sm" weight="medium" className="text-gray-500 flex-1">
                APPLICATION
              </Text>
              <Text size="sm" weight="medium" className="text-gray-500 flex-1">
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
              <Link to="/settings/apps">
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
        </div>
      </div>
    </div>
  )
}
