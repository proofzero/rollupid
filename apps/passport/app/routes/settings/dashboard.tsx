import { Text } from '@proofzero/design-system'

import SectionTitle from '~/components/typography/sectionTitle'
import { AccountList } from '~/components/accounts/AccountList'

import { Link, useNavigate } from '@remix-run/react'

import dashboardChart from '~/assets/dashboard_chart.svg'
import type { AccountListItemProps } from '~/components/accounts/AccountListItem'
import { NestedErrorPage } from '@proofzero/design-system/src/pages/nested-error/NestedErrorPage'

import { WarningCTA } from '@proofzero/design-system/src/molecules/cta/warning'

import { useOutletContext } from '@remix-run/react'
import type { AccountURN } from '@proofzero/urns/account'
import { AuthorizedAppsModel } from '../settings'
import { ToastType, toast } from '@proofzero/design-system/src/atoms/toast'
import { useEffect } from 'react'

export default function DashboardLayout() {
  const { connectedProfiles, authorizedApps, primaryAccountURN } =
    useOutletContext<{
      connectedProfiles: any[]
      authorizedApps: AuthorizedAppsModel[]
      primaryAccountURN: AccountURN
    }>()

  const navigate = useNavigate()

  const appErrorExists = authorizedApps.some(
    (app) => app.appDataError || app.appScopeError
  )

  useEffect(() => {
    const url = new URL(window.location.href)

    const toastResult = url.searchParams.get('toast')
    if (toastResult) {
      switch (toastResult) {
        case 'groupdeny':
          toast(
            ToastType.Warning,
            { message: 'Group invitation was cancelled by user' },
            { duration: 2000 }
          )
          break
      }

      url.searchParams.delete('toast')

      history.replaceState(null, '', url.toString())
    }
  }, [])

  return (
    <div className="w-full h-full flex flex-col">
      <div className="pb-6">
        <Text weight="semibold" size="2xl">
          Dashboard
        </Text>
      </div>
      {appErrorExists ? (
        <WarningCTA
          description="We detected a data error in your application(s).
      Please revoke the authorization and re-authorize again in the affected application."
          btnText="Applications"
          clickHandler={() => {
            navigate('/settings/applications')
          }}
        />
      ) : null}
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

            <AccountList
              primaryAccountURN={primaryAccountURN}
              accounts={connectedProfiles as AccountListItemProps[]}
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
                {authorizedApps.map((a) => (
                  <article
                    key={a.title}
                    className="flex flex-row space-x-4 items-center py-5 px-8"
                  >
                    <div className="flex-1 w-min flex flex-row items-center space-x-2">
                      <img
                        src={a.icon}
                        alt="app icon"
                        className={`object-cover w-6 h-6 ${
                          a.appDataError || a.appScopeError ? '' : 'rounded'
                        }`}
                      />
                      {a.title ? (
                        <Text
                          size="sm"
                          weight="medium"
                          className="text-gray-500 w-fit py-[2px]"
                        >
                          {a.title}
                        </Text>
                      ) : null}
                      {a.appDataError || a.appScopeError ? (
                        <Text
                          size="sm"
                          weight="normal"
                          className="text-gray-500 w-max py-[2px] px-2
                            text-[#EA580C] bg-orange-50 rounded-xl"
                        >
                          Data Error
                        </Text>
                      ) : null}
                    </div>

                    <Text
                      size="sm"
                      weight="medium"
                      className="text-gray-500 flex-1 text-ellipsis"
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
                ))}
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
