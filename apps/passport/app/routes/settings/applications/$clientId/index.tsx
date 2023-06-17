import type { LoaderFunction } from '@remix-run/cloudflare'
import { useLoaderData, useOutletContext } from '@remix-run/react'

import { loader as scopesLoader } from './scopes'
import type { AuthorizedAppsModel } from '~/routes/settings'
import { Button, Text } from '@proofzero/design-system'
import { FaChevronRight } from 'react-icons/fa'

import { useMemo, useState } from 'react'
import { getDefaultIconUrl } from '~/components/addresses/AddressListItem'

import { useHydrated } from 'remix-utils'
import {
  ClaimsMobileView,
  ClaimsWideView,
  ConfirmRevocationModal,
} from '~/components/applications/claims'
import type { GetAuthorizedAppScopesMethodResult } from '@proofzero/platform/access/src/jsonrpc/methods/getAuthorizedAppScopes'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { getStarbaseClient } from '~/platform.server'
import { getValidatedSessionContext } from '~/session.server'
import { ScopeMeta } from '@proofzero/security/scopes'

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, params, context }) => {
    const { jwt } = await getValidatedSessionContext(
      request,
      context.authzQueryParams,
      context.env,
      context.traceSpan
    )
    const { clientId } = params
    const scopeValues = await scopesLoader({
      request,
      params,
      context,
    })

    const sbClient = getStarbaseClient(jwt, context.env, context.traceSpan)

    const { scopes: scopeMeta } = await sbClient.getScopes.query()

    return {
      clientId,
      scopeValues,
      scopeMeta,
    }
  }
)

export default () => {
  const { authorizedApps, connectedProfiles } = useOutletContext<{
    authorizedApps: AuthorizedAppsModel[]
    connectedProfiles: any[]
  }>()

  const { clientId } = useLoaderData()
  const app = authorizedApps.find((app) => app.clientId === clientId)!

  const { scopeValues, scopeMeta } = useLoaderData<{
    scopeValues: GetAuthorizedAppScopesMethodResult
    scopeMeta: ScopeMeta
  }>()

  const modeledScopes = useMemo(() => {
    const aggregator = []

    for (const scopeValue of scopeValues.scopes) {
      if (
        Object.keys(scopeValues.claimValues).includes(scopeValue) &&
        !scopeValues.claimValues[scopeValue].meta.valid
      )
        continue
      if (scopeValue === 'email') {
        const profile = connectedProfiles.find(
          //There should be only one address urn provided for email
          (profile) =>
            profile.urn === scopeValues.claimValues[scopeValue].meta.urns[0]
        )
        aggregator.push({
          claim: 'email',
          icon: profile.icon,
          address: profile.address,
          type: profile.type,
          sourceIcon: getDefaultIconUrl(profile.type),
        })
      } else if (scopeValue === 'connected_accounts') {
        const profiles = connectedProfiles.filter((profile) =>
          scopeValues.claimValues[scopeValue].meta.urns.includes(profile.urn)
        )

        aggregator.push({
          claim: 'connected_accounts',
          accounts: profiles.map((profile) => ({
            icon: profile.icon,
            address: profile.address,
            type: profile.type === 'eth' ? 'blockchain' : profile.type,
          })),
        })
      } else if (scopeValue === 'profile') {
        aggregator.push({
          claim: 'profile',
          account: {
            address: scopeValues.claimValues[scopeValue].claims.name,
            icon: scopeValues.claimValues[scopeValue].claims.picture,
          },
        })
      } else if (scopeValue === 'erc_4337') {
        const profiles = connectedProfiles.filter((profile) =>
          scopeValues.claimValues[scopeValue].meta.urns.includes(profile.urn)
        )
        aggregator.push({
          claim: 'erc_4337',
          accounts: profiles.map((profile) => ({
            icon: profile.icon,
            address: profile.address,
            title: profile.title,
            type: 'blockchain',
          })),
        })
      } else if (scopeMeta[scopeValue].hidden) {
        aggregator.push({
          claim: 'system_identifiers',
        })
      }
    }

    return aggregator
  }, [scopeValues])

  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false)

  const hydrated = useHydrated()

  return (
    <>
      <ConfirmRevocationModal
        title={app.title!}
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
        <img
          src={app.icon}
          className="w-12 h-12 lg:w-16 lg:h-16 rounded-lg"
          alt="app icon"
        />

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
          <ClaimsMobileView scopes={modeledScopes} />

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
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-50 rounded-t-lg">
              <tr className="rounded-t-lg">
                <th className="px-6 py-3 text-left rounded-tl-lg">
                  <Text
                    size="xs"
                    weight="medium"
                    className="uppercase text-gray-500"
                  >
                    App Asked For
                  </Text>
                </th>
                <th className="px-6 py-3 text-left">
                  <Text
                    size="xs"
                    weight="medium"
                    className="uppercase text-gray-500"
                  >
                    What’s being shared
                  </Text>
                </th>
                <th className="px-6 py-3 text-left rounded-tr-lg">
                  <Text
                    size="xs"
                    weight="medium"
                    className="uppercase text-gray-500"
                  >
                    SOURCE of DATA
                  </Text>
                </th>
              </tr>
            </thead>

            <tbody className="border-t border-gray-200">
              <ClaimsWideView scopes={modeledScopes} />
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
