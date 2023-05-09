import { LoaderFunction } from '@remix-run/cloudflare'
import { useLoaderData, useOutletContext } from '@remix-run/react'

import { loader as scopesLoader } from './scopes'
import { AuthorizedAppsModel } from '~/routes/settings'
import { Button, Text } from '@proofzero/design-system'
import { FaChevronRight } from 'react-icons/fa'

import { useState } from 'react'
import { getDefaultIconUrl } from '~/components/addresses/AddressListItem'

import { useHydrated } from 'remix-utils'
import {
  ClaimsMobileView,
  ClaimsWideView,
  ConfirmRevocationModal,
} from '~/components/applications/claims'

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
