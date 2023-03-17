import { Link, useFetcher, useOutletContext } from '@remix-run/react'

import { Text } from '@proofzero/design-system/src/atoms/text/Text'

import SectionTitle from '~/components/typography/SectionTitle'

import { useEffect } from 'react'

import dashboardChart from '~/assets/dashboard_chart.svg'
import { NestedErrorPage } from '@proofzero/design-system/src/pages/nested-error/NestedErrorPage'
import { Spinner } from '@proofzero/design-system/src/atoms/spinner/Spinner'
import type { FullProfile } from '~/types'

import CTA from '~/components/cta/cta'
import { normalizeProfileToConnection } from '~/helpers/profile'
import { AddressList } from '~/components/addresses/AddressList'
import type { AddressListItemProps } from '~/components/addresses/AddressListItem'

export default function Welcome() {
  const { profile, connectedProfiles } = useOutletContext<{
    profile: FullProfile
    connectedProfiles: any[]
  }>()

  const normalizedConnectedProfiles = connectedProfiles
    .map((p) => ({ urn: p.urn, ...p?.profile }))
    .map(normalizeProfileToConnection)

  const appFetcher = useFetcher()

  useEffect(() => {
    appFetcher.load('/api/apps')
  }, [])

  return (
    <div className="dashboard flex flex-col gap-4 py-2">
      <CTA profile={profile} addresses={connectedProfiles} />

      <div className="flex flex-col space-y-5 lg:flex-row lg:space-x-5 lg:space-y-0">
        <div className="flex-1 flex flex-col space-y-5 w-full">
          <div>
            <SectionTitle title="Activity" />

            <div
              className="w-full h-[205px] border border-gray-200 
              rounded-lg shadow mt-4 flex justify-center items-center "
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

              <Link className="mb-3" to="/account/connections">
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

        <div className="flex-1 flex flex-col">
          <SectionTitle title="Applications" />

          {appFetcher.type === 'done' && appFetcher.data?.error ? (
            <NestedErrorPage />
          ) : (
            <div className="border shadow flex-1 flex flex-col rounded-lg mb-4 sm:mb-0">
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
                {appFetcher.state !== 'idle' && (
                  <div className="flex flex-1 justify-center items-center">
                    <Spinner />
                  </div>
                )}
                {appFetcher.type === 'done' &&
                  !appFetcher.data.error &&
                  appFetcher.data.apps.map(
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
                <Link to="/account/applications">
                  <Text
                    size="sm"
                    weight="medium"
                    className="cursor-pointer text-indigo-500 my-4"
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
