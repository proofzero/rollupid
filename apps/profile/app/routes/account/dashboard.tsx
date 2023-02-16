import { Link, useFetcher, useOutletContext } from '@remix-run/react'

import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import Heading from '~/components/typography/Heading'
import SectionTitle from '~/components/typography/SectionTitle'

import type { Profile } from '@kubelt/galaxy-client'
import { useEffect, useState } from 'react'
import { Button } from '@kubelt/design-system/src/atoms/buttons/Button'

import dashboardChart from '~/assets/dashboard_chart.svg'
import { normalizeProfileToLinks } from '~/helpers'
import { Tooltip } from 'flowbite-react'
import { NestedErrorPage } from '@kubelt/design-system/src/pages/nested-error/NestedErrorPage'
import { Spinner } from '@kubelt/design-system/src/atoms/spinner/Spinner'

export default function Welcome() {
  const { profile, addressProfiles } = useOutletContext<{
    profile: Profile
    addressProfiles: any[]
  }>()

  const normalizedProfiles = addressProfiles
    .map((p) => ({ urn: p.urn, ...p?.profile }))
    .map(normalizeProfileToLinks)

  const [showGetStarted, setShowGetStarted] = useState(true)

  const appFetcher = useFetcher()

  useEffect(() => {
    appFetcher.load('/account/dashboard/apps')
  }, [])

  return (
    <div className="dashboard flex flex-col gap-4">
      <div
        className="welcome-banner basis-full rounded-lg"
        style={{
          backgroundColor: '#F9FAFB',
          padding: '30px 30px 23px 16px',
        }}
      >
        <Heading className="mb-3 flex flex-col lg:flex-row gap-4">
          <span className="order-2 text-center justify-center align-center lg:order-1">
            Congratulations, {profile.displayName}!
          </span>
          <span className="order-1 text-center justify-center align-center lg:order-2">
            🎉
          </span>
        </Heading>

        <Text
          weight="normal"
          size="base"
          className="text-center lg:text-left text-gray-500"
        >
          Welcome to the Rollup. We are currently in beta and will be unlocking
          new features often.
        </Text>

        <Text
          weight="normal"
          size="base"
          className="text-center lg:text-left text-gray-500"
        >
          Follow us on{' '}
          <a className="!text-indigo-500" href="https://twitter.com/rollupid">
            Twitter
          </a>{' '}
          and join our{' '}
          <a className="!text-indigo-500" href="https://discord.gg/rollupid">
            Discord
          </a>{' '}
          to stay updated!
        </Text>
      </div>

      {showGetStarted && (
        <div className="flex flex-row p-4 border items-center rounded-lg shadow">
          <div className="p-2.5 bg-indigo-50 rounded-lg">
            <svg
              width="42"
              height="42"
              viewBox="0 0 42 42"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_7573_12929)">
                <path
                  d="M21 19.25C24.866 19.25 28 16.116 28 12.25C28 8.38401 24.866 5.25 21 5.25C17.134 5.25 14 8.38401 14 12.25C14 16.116 17.134 19.25 21 19.25Z"
                  stroke="#6366F1"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10.5 36.75V33.25C10.5 31.3935 11.2375 29.613 12.5503 28.3003C13.863 26.9875 15.6435 26.25 17.5 26.25H24.5C26.3565 26.25 28.137 26.9875 29.4497 28.3003C30.7625 29.613 31.5 31.3935 31.5 33.25V36.75"
                  stroke="#6366F1"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
              <defs>
                <clipPath id="clip0_7573_12929">
                  <rect width="42" height="42" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>

          <div className="flex-1 mx-5 flex-col">
            <Text size="lg" weight="semibold" className="text-gray-800">
              Get started
            </Text>
            <Text size="sm" weight="normal" className="text-gray-500">
              Fill out your profile information
            </Text>
          </div>

          <div className="flex flex-row space-x-6 items-center">
            <Text
              size="xs"
              weight="normal"
              className="text-indigo-500 cursor-pointer"
              onClick={() => setShowGetStarted(false)}
            >
              Ignore
            </Text>
            <Link to="/account/settings">
              <Button btnType="primary">Go to Settings</Button>
            </Link>
          </div>
        </div>
      )}

      <div className="flex flex-col space-y-5 lg:flex-row lg:space-x-5 lg:space-y-0">
        <div className="flex-1 flex flex-col space-y-5 w-full">
          <div>
            <SectionTitle title="Activity" />

            <div
              className="w-full h-[205px] mt-4 flex justify-center items-center border-gray-200 rounded-lg shadow"
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
                  weight="normal"
                  className="text-indigo-500 cursor-pointer"
                >
                  Edit
                </Text>
              </Link>
            </div>

            <div className="flex flex-col space-y-2">
              {normalizedProfiles.map((np, i) => (
                <div
                  key={i}
                  className="flex flex-row items-center border rounded-lg shadow p-4"
                >
                  <img
                    className="w-8 h-8 rounded-full mr-3.5"
                    alt="normalized profile pic"
                    src={np.icon}
                  />

                  <div className="flex flex-col space-y-1.5 flex-1 break-all">
                    <Text size="sm" weight="medium" className="text-gray-700">
                      {np.title}
                    </Text>
                    <Text size="xs" weight="normal" className="text-gray-500">
                      {np.address}
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <SectionTitle title="Applications" />

          {appFetcher.type === 'done' && appFetcher.data?.error ? (
            <NestedErrorPage />
          ) : (
            <div className="border shadow flex-1 flex flex-col rounded-lg">
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
                            className="w-6 h-6 rounded"
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
                <Tooltip
                  content="Coming soon!"
                  trigger="hover"
                  data-tooltip-style="light"
                  style="light"
                >
                  <Text
                    size="sm"
                    weight="medium"
                    className="cursor-pointer text-indigo-500 my-4"
                  >
                    View All
                  </Text>
                </Tooltip>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
