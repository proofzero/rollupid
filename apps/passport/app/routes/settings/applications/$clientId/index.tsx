import { LoaderFunction } from '@remix-run/cloudflare'
import { useFetcher, useLoaderData, useOutletContext } from '@remix-run/react'

import { loader as scopesLoader } from './scopes'
import { AuthorizedAppsModel } from '~/routes/settings'
import { Button, Text } from '@proofzero/design-system'
import { FaChevronDown, FaChevronRight } from 'react-icons/fa'

import MultiAvatar from '@proofzero/design-system/src/molecules/avatar/MultiAvatar'
import UserPill from '@proofzero/design-system/src/atoms/pills/UserPill'

import { Disclosure } from '@headlessui/react'
import { useState } from 'react'
import { getDefaultIconUrl } from '~/components/addresses/AddressListItem'

import passportLogoURL from '~/assets/PassportIcon.svg'
import { Modal } from '@proofzero/design-system/src/molecules/modal/Modal'
import warningImg from '~/assets/warning.svg'
import InputText from '~/components/inputs/InputText'
import { useHydrated } from 'remix-utils'
import { startCase } from 'lodash'

const ConfirmRevocationModal = ({
  title,
  clientId,
  isOpen,
  setIsOpen,
}: {
  title: string
  clientId: string
  isOpen: boolean
  setIsOpen: (val: boolean) => void
}) => {
  const [confirmationString, setConfirmationString] = useState('')
  const fetcher = useFetcher()

  return (
    <Modal isOpen={isOpen} handleClose={() => setIsOpen(false)}>
      <div
        className={`min-w-[260px] sm:min-w-[400px] md:max-w-[512px] lg:max-w-[512px]
     relative transform rounded-lg bg-white px-4 pt-5 pb-4 text-left
    shadow-xl transition-all sm:p-6 overflow-y-auto`}
      >
        <div className="flex flex-row space-x-6 items-center justify-start">
          <img
            src={warningImg}
            className="object-cover w-10 h-10 rounded"
            alt="Not found"
          />

          <div className="flex flex-col space-y-2">
            <Text weight="medium" size="lg" className="text-gray-900">
              Revoke Access
            </Text>
            <Text size="xs" weight="normal">
              {`Are you sure you want to revoke access to ${title}? This action
              cannot be undone once confirmed.`}
            </Text>
          </div>
        </div>
        <div className="flex flex-col my-7 space-y-2">
          <InputText
            onChange={(text: string) => {
              setConfirmationString(text)
            }}
            heading="Type REVOKE to confirm*"
          />
        </div>

        <div className="flex justify-end items-center space-x-3">
          <Button
            btnType="secondary-alt"
            onClick={() => setIsOpen(false)}
            className="bg-gray-100"
          >
            Cancel
          </Button>

          <fetcher.Form
            action={`/settings/applications/${clientId}/revoke`}
            method="post"
          >
            <Button
              type="submit"
              btnType="dangerous-alt"
              disabled={confirmationString !== 'REVOKE'}
            >
              Revoke Access
            </Button>
          </fetcher.Form>
        </div>
      </div>
    </Modal>
  )
}

const ClaimsMobileView = ({ claims }: { claims: any[] }) => {
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
                  <FaChevronDown className="w-4 h-4 text-indigo-500" />
                ) : (
                  <FaChevronRight className="w-4 h-4 text-gray-500" />
                )}
              </section>
            </Disclosure.Button>

            <Disclosure.Panel className="flex flex-col gap-3.5 px-3.5 py-2 pointer-events-none">
              <div className="w-full -mt-2">
                <div className="border-t border-gray-200"></div>
              </div>

              <section className="flex flex-row flex-wrap gap-2">
                {accounts.map((a, i) => (
                  <UserPill
                    key={i}
                    size={20}
                    text={a.address}
                    avatarURL={a.icon}
                    onClick={() => setSelectedAccount(a)}
                    className={'pointer-events-auto'}
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
                      Address:
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
                      {`${startCase(selectedAccount.type)} - ${
                        selectedAccount.address
                      }`}
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
      {claims.map((claim, i) => {
        switch (claim.claim) {
          case 'email':
            return (
              <EmailView
                key={i}
                address={claim.address}
                sourceIcon={claim.sourceIcon}
              />
            )
          case 'connected_accounts':
            return <ConnectedAccountsView key={i} accounts={claim.accounts} />
        }
      })}
    </div>
  )
}

const ClaimsWideView = ({ claims }: { claims: any[] }) => {
  const EmailView = ({
    address,
    sourceIcon,
  }: {
    address: string
    sourceIcon: string
  }) => {
    return (
      <>
        <tr>
          <td className="px-6 py-3">
            <Text size="sm" weight="medium" className="text-gray-500 truncate">
              Email
            </Text>
          </td>
          <td className="px-6 py-3">
            <Text size="sm" weight="medium" className="text-gray-500 truncate">
              {address}
            </Text>
          </td>
          <td className="px-6 py-3 flex flex-row items-center gap-1.5">
            {sourceIcon && <img src={sourceIcon} className="w-5 h-5" />}{' '}
            <Text size="sm" weight="medium" className="text-gray-500 truncate">
              {address}
            </Text>
          </td>
        </tr>
      </>
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

    return (
      <Disclosure>
        {({ open }) => (
          <>
            <tr>
              <td className={`px-6 py-3 ${open ? `bg-gray-50` : ''}`}>
                <Disclosure.Button className="flex flex-row items-center gap-1.5">
                  {open ? (
                    <FaChevronDown className="w-3 h-3 text-indigo-500" />
                  ) : (
                    <FaChevronRight className="w-3 h-3 text-gray-500" />
                  )}

                  <Text
                    size="sm"
                    weight="medium"
                    className="text-gray-500 truncate"
                  >
                    Connected Accounts
                  </Text>
                </Disclosure.Button>
              </td>
              <td className="px-6 py-3">
                <MultiAvatar avatars={accounts.map((a) => a.icon)} />
              </td>
              <td className="px-6 py-3 flex flex-row items-center gap-2.5">
                <img src={passportLogoURL} className="w-5 h-5" />

                <Text
                  size="sm"
                  weight="medium"
                  className="text-gray-500 truncate"
                >
                  Rollup Identity
                </Text>
              </td>
            </tr>

            <Disclosure.Panel as="tr">
              <td
                colSpan={4}
                className="py-3.5 px-6 bg-gray-50 border shadow-inner"
              >
                <Text className="mb-2">Connected Accounts</Text>

                <section className="flex flex-row flex-wrap gap-2">
                  {accounts.map((a, i) => (
                    <UserPill
                      key={i}
                      size={20}
                      text={a.address}
                      avatarURL={a.icon}
                      onClick={() => setSelectedAccount(a)}
                      className={'pointer-events-auto'}
                    />
                  ))}
                </section>

                {selectedAccount && (
                  <div className="flex flex-col gap-2 p-2.5 bg-white rounded-lg mt-2">
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
                      <Text
                        size="xs"
                        weight="semibold"
                        className="text-gray-500"
                      >
                        Address:
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
                      <Text
                        size="xs"
                        weight="semibold"
                        className="text-gray-500"
                      >
                        Source:
                      </Text>
                      <Text
                        size="xs"
                        weight="medium"
                        className="text-gray-500 truncate"
                      >
                        {`${startCase(selectedAccount.type)} - ${
                          selectedAccount.address
                        }`}
                      </Text>
                    </div>

                    <div className="flex flex-row gap-1 items-center">
                      <Text
                        size="xs"
                        weight="semibold"
                        className="text-gray-500"
                      >
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
                  </div>
                )}
              </td>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    )
  }

  return (
    <>
      {claims.map((claim, i) => {
        switch (claim.claim) {
          case 'email':
            return (
              <EmailView
                key={i}
                address={claim.address}
                sourceIcon={claim.sourceIcon}
              />
            )
          case 'connected_accounts':
            return <ConnectedAccountsView key={i} accounts={claim.accounts} />
        }
      })}
    </>
  )
}

export const loader: LoaderFunction = async ({ request, params, context }) => {
  const { clientId } = params
  const mappedScopeSets = await scopesLoader({
    request,
    params,
    context,
  })

  return {
    clientId,
    mappedScopeSets,
  }
}

export default () => {
  const { authorizedApps, connectedProfiles } = useOutletContext<{
    authorizedApps: AuthorizedAppsModel[]
    connectedProfiles: any[]
  }>()

  const { clientId } = useLoaderData()
  const app = authorizedApps.find((app) => app.clientId === clientId)!

  const { mappedScopeSets } = useLoaderData<{
    mappedScopeSets: {
      scopes: any[]
      claims: any
    }[]
  }>()

  const modeledScopes = mappedScopeSets.map((scopeSet) => {
    const claimKeys = Object.keys(scopeSet.claims)
    const claims = claimKeys
      .filter((ck) => ['email', 'connected_accounts'].includes(ck))
      .map((claimKey: string) => {
        switch (claimKey) {
          case 'email':
            const profile = connectedProfiles.find(
              (profile) => profile.urn === scopeSet.claims[claimKey].urn
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
              scopeSet.claims[claimKey]
                .map((account: any) => account.urn)
                .includes(profile.urn)
            )

            return {
              claim: 'connected_accounts',
              accounts: profiles.map((profile) => ({
                icon: profile.icon,
                address: profile.address,
                type: profile.type === 'eth' ? 'blockchain' : profile.type,
              })),
            }
          }
        }
      })

    return {
      claims,
    }
  })

  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false)

  const hydrated = useHydrated()

  return (
    <>
      <ConfirmRevocationModal
        title={app.title}
        clientId={app.clientId}
        isOpen={confirmationModalOpen}
        setIsOpen={setConfirmationModalOpen}
      />

      <nav className="flex items-center gap-4">
        <Text size="sm" weight="medium" className="text-gray-600">
          Applications
        </Text>

        <FaChevronRight className="w-3 h-3 text-gray-400" />

        <Text size="sm" weight="medium" className="text-gray-400">
          {app.title}
        </Text>
      </nav>

      <section className="bg-white gap-5 flex flex-row items-center my-6 lg:py-4 lg:px-5 lg:border lg:shadow lg:rounded-lg">
        <img src={app.icon} className="w-12 h-12 lg:w-16 lg:h-16 rounded-lg" />

        <div className="flex-1">
          <Text
            size="lg"
            weight="semibold"
            className="text-gray-900 mb-1.5 lg:mb-3"
          >
            {app.title}
          </Text>

          {hydrated && (
            <Text size="sm" weight="medium" className="text-gray-500">
              {new Date(app.timestamp).toLocaleString('default', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </Text>
          )}
        </div>

        <Button
          type="submit"
          btnType="dangerous-alt"
          onClick={() => {
            setConfirmationModalOpen(true)
          }}
          className="hidden lg:block"
        >
          Revoke Access
        </Button>
      </section>

      <section>
        <div className="lg:hidden">
          {modeledScopes.map((scope, i) => (
            <ClaimsMobileView key={i} {...scope} />
          ))}

          <Button
            type="submit"
            btnType="dangerous-alt"
            onClick={() => {
              setConfirmationModalOpen(true)
            }}
            className="mt-4 w-full"
          >
            Revoke Access
          </Button>
        </div>

        <div className="hidden lg:block border rounded-lg">
          <table className="min-w-full bg-white rounded-lg">
            <thead className="bg-gray-50 rounded-t-lg">
              <tr className="rounded-t-lg">
                <th className="px-6 py-3 text-left rounded-tl-lg">
                  <Text
                    size="xs"
                    weight="medium"
                    className="uppercase text-gray-500"
                  >
                    Claim Name
                  </Text>
                </th>
                <th className="px-6 py-3 text-left">
                  <Text
                    size="xs"
                    weight="medium"
                    className="uppercase text-gray-500"
                  >
                    Claim Value
                  </Text>
                </th>
                <th className="px-6 py-3 text-left rounded-tr-lg">
                  <Text
                    size="xs"
                    weight="medium"
                    className="uppercase text-gray-500"
                  >
                    Source
                  </Text>
                </th>
              </tr>
            </thead>

            {modeledScopes.map((scope, i) => (
              <tbody key={i} className="border-t border-gray-200">
                <ClaimsWideView key={scope.claims.join(' ')} {...scope} />
              </tbody>
            ))}
          </table>
        </div>
      </section>
    </>
  )
}
