import { LoaderFunction } from '@remix-run/cloudflare'
import { useLoaderData, useOutletContext } from '@remix-run/react'

import { loader as scopesLoader } from './scopes'
import { AuthorizedAppsModel } from '~/routes/settings'
import { Text } from '@proofzero/design-system'
import { FaChevronDown, FaChevronRight, FaChevronUp } from 'react-icons/fa'

import MultiAvatar from '@proofzero/design-system/src/molecules/avatar/MultiAvatar'
import UserPill from '@proofzero/design-system/src/atoms/pills/UserPill'

import { Disclosure } from '@headlessui/react'
import { useState } from 'react'
import { getDefaultIconUrl } from '~/components/addresses/AddressListItem'

import { useHydrated } from '@proofzero/design-system/src/hooks/useHydrated'

export const loader: LoaderFunction = async ({ request, params, context }) => {
  const { clientId } = params
  const scopes = await scopesLoader({
    request,
    params,
    context,
  })

  return {
    clientId,
    scopes,
  }
}

const ClaimsMobileView = ({
  timestamp,
  claims,
}: {
  timestamp: number
  claims: any[]
}) => {
  console.log({
    timestamp,
  })

  const hydrated = useHydrated()

  const EmailView = ({
    address,
    sourceIcon,
  }: {
    address: string
    sourceIcon: string
  }) => {
    return (
      <div className="border border-gray-200 rounded-lg flex flex-row items-center px-3.5 py-2">
        <div className="flex-1 flex flex-col gap-2.5">
          <Text size="sm" weight="bold" className="text-gray-800">
            Email
          </Text>

          <Text size="xs" weight="medium" className="text-gray-500 truncate">
            {address}
          </Text>
        </div>

        {sourceIcon && <img src={sourceIcon} className="w-5 h-5" />}
      </div>
    )
  }

  const ConnectedAccountsView = ({
    accounts,
  }: {
    accounts: {
      icon: string
      address: string
      type: string
    }[]
  }) => {
    const [selectedAccount, setSelectedAccount] = useState<
      | {
          icon: string
          address: string
          type: string
        }
      | undefined
    >()

    const hydrated = useHydrated()

    return (
      <Disclosure>
        {({ open }) => (
          <div className="border border-gray-200 rounded-lg flex flex-col focus-within:bg-gray-50 w-full">
            <Disclosure.Button
              className="flex flex-row items-center px-3.5 py-2"
              onClick={() => {
                setSelectedAccount(undefined)
              }}
            >
              <section className="flex-1 flex flex-col gap-2.5">
                <Text
                  size="sm"
                  weight="bold"
                  className="text-gray-800 text-start"
                >
                  Connected Addresses
                </Text>
                <MultiAvatar
                  cutoff={7}
                  avatars={accounts.map((a) => a.icon)}
                  size={16}
                />
              </section>
              <section>
                {open ? (
                  <FaChevronUp className="w-5 h-5 text-indigo-500" />
                ) : (
                  <FaChevronDown className="w-5 h-5 text-indigo-500" />
                )}
              </section>
            </Disclosure.Button>

            <Disclosure.Panel className="flex flex-col gap-3.5 px-3.5 py-2 pointer-events-none">
              <div className="w-full -mt-2">
                <div className="border-t border-gray-200"></div>
              </div>

              <section className="flex flex-row flex-wrap gap-2">
                {accounts.map((a) => (
                  <UserPill
                    key={`${timestamp}-${a.address}`}
                    size={20}
                    text={a.address}
                    avatarURL={a.icon}
                    onClick={() => setSelectedAccount(a)}
                    className={'max-w-[123px] pointer-events-auto'}
                  />
                ))}
              </section>

              {selectedAccount && (
                <div className="flex flex-col gap-2 p-2.5 bg-white rounded-lg">
                  <section className="flex flex-row gap-2 items-center">
                    <img
                      src={selectedAccount.icon}
                      className="rounded-full w-5 h-5"
                    />

                    <Text
                      size="sm"
                      weight="semibold"
                      className="text-gray-800 truncate"
                    >
                      {selectedAccount.address}
                    </Text>
                  </section>

                  <div className="flex flex-row gap-1 items-center">
                    <Text size="xs" weight="semibold" className="text-gray-500">
                      Email:
                    </Text>
                    <Text
                      size="xs"
                      weight="medium"
                      className="text-gray-500 truncate"
                    >
                      {selectedAccount.address}
                    </Text>
                  </div>

                  <div className="flex flex-row gap-1 items-center">
                    <Text size="xs" weight="semibold" className="text-gray-500">
                      Source:
                    </Text>
                    <Text
                      size="xs"
                      weight="medium"
                      className="text-gray-500 truncate"
                    >
                      {`${selectedAccount.type[0].toUpperCase()}${selectedAccount.type.slice(
                        1
                      )} - ${selectedAccount.address}`}
                    </Text>
                  </div>

                  <div className="flex flex-row gap-1 items-center">
                    <Text size="xs" weight="semibold" className="text-gray-500">
                      Picture:
                    </Text>
                    <Text
                      size="xs"
                      weight="medium"
                      className="text-gray-500 truncate"
                    >
                      {selectedAccount.icon}
                    </Text>
                  </div>

                  <div className="flex flex-row gap-1 items-center">
                    <Text size="xs" weight="semibold" className="text-gray-500">
                      Verified:
                    </Text>
                    <Text
                      size="xs"
                      weight="medium"
                      className="text-gray-500 truncate"
                    >
                      Yes
                    </Text>
                  </div>

                  <div className="flex flex-row gap-1 items-center">
                    <Text size="xs" weight="semibold" className="text-gray-500">
                      Approved:
                    </Text>
                    <Text
                      size="xs"
                      weight="medium"
                      className="text-gray-500 truncate"
                    >
                      {hydrated &&
                        new Date(timestamp * 1000).toLocaleString('default', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                    </Text>
                  </div>
                </div>
              )}
            </Disclosure.Panel>
          </div>
        )}
      </Disclosure>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <Text size="sm" weight="medium" className="text-gray-500 truncate">
        {hydrated &&
          new Date(timestamp * 1000).toLocaleString('default', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
      </Text>

      {claims.map((claim) => {
        switch (claim.claim) {
          case 'email':
            return (
              <EmailView
                key={`${timestamp}-${claim.claim}`}
                address={claim.address}
                sourceIcon={claim.sourceIcon}
              />
            )
          case 'connected_accounts':
            return (
              <ConnectedAccountsView
                key={`${timestamp}-${claim.claim}`}
                accounts={claim.accounts}
              />
            )
        }
      })}
    </div>
  )
}

export default () => {
  const { authorizedApps, connectedProfiles } = useOutletContext<{
    authorizedApps: AuthorizedAppsModel[]
    connectedProfiles: any[]
  }>()

  const { clientId } = useLoaderData()
  const app = authorizedApps.find((app) => app.clientId === clientId)!

  const { scopes } = useLoaderData<{
    scopes: any[]
  }>()

  const modeledScopes = scopes.map((scope) => {
    const ts = scope.timestamp
    const claimKeys = Object.keys(scope.claims)
    const claims = claimKeys
      .filter((ck) => ['email', 'connected_accounts'].includes(ck))
      .map((claimKey: any) => {
        switch (claimKey) {
          case 'email':
            const profile = connectedProfiles.find(
              (profile) => profile.urn === scope.claims[claimKey].urn
            )

            return {
              claim: 'email',
              icon: profile.icon,
              address: profile.address,
              type: profile.type,
              sourceIcon: getDefaultIconUrl(profile.type),
            }
          case 'connected_accounts': {
            const profiles = connectedProfiles.filter((profile) =>
              scope.claims[claimKey]
                .map((account: any) => account.urn)
                .includes(profile.urn)
            )

            return {
              claim: 'connected_accounts',
              accounts: profiles.map((profile) => ({
                icon: profile.icon,
                address: profile.address,
                type: profile.type,
              })),
            }
          }
        }
      })

    return {
      timestamp: ts,
      claims,
    }
  })

  return (
    <>
      <nav className="flex items-center gap-4">
        <Text size="sm" weight="medium" className="text-gray-600">
          Applications
        </Text>

        <FaChevronRight className="w-3 h-3 text-gray-400" />

        <Text size="sm" weight="medium" className="text-gray-400">
          {app.title}
        </Text>
      </nav>

      <section className="bg-white gap-5 flex flex-row items-center my-6">
        <img src={app.icon} className="w-12 h-12 rounded-lg" />

        <Text size="lg" weight="semibold" className="text-gray-900">
          {app.title}
        </Text>
      </section>

      <section>
        {modeledScopes.map((scope) => (
          <ClaimsMobileView {...scope} />
        ))}
      </section>

      {/* <pre>
        {JSON.stringify(
          {
            scopes,
            connectedProfiles,
            modeledScopes,
          },
          null,
          2
        )}
      </pre> */}
    </>
  )
}
