import type { LoaderFunction } from '@remix-run/cloudflare'
import { useLoaderData, useOutletContext } from '@remix-run/react'

import { loader as scopesLoader } from './scopes'
import type { AuthorizedAppsModel } from '~/routes/settings'
import { Button, Text } from '@proofzero/design-system'
import { FaChevronRight } from 'react-icons/fa'

import { useMemo, useState } from 'react'
import { getDefaultIconUrl } from '~/components/accounts/AccountListItem'

import { useHydrated } from 'remix-utils'
import {
  ClaimsMobileView,
  ClaimsWideView,
  ConfirmRevocationModal,
} from '~/components/applications/claims'
import type { GetAuthorizedAppScopesMethodResult } from '@proofzero/platform/authorization/src/jsonrpc/methods/getAuthorizedAppScopes'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { getCoreClient } from '~/platform.server'
import { getValidatedSessionContext } from '~/session.server'
import type { ScopeMeta } from '@proofzero/security/scopes'
import { EmailAccountType } from '@proofzero/types/account'

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

    const coreClient = getCoreClient({ context, jwt })
    const { scopes: scopeMeta } = await coreClient.starbase.getScopes.query()

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
        //There should be only one account urn provided for email
        const scope = scopeValues.claimValues[scopeValue]
        const { meta } = scope
        const masked = scope.claims.type === EmailAccountType.Mask
        const urn = masked ? meta.source?.urn : meta.urns[0]
        const profile = connectedProfiles.find((profile) => profile.urn === urn)

        const claim = 'email'
        const address = masked ? scope.claims.email : profile.address
        const { icon, type } = profile
        const source = scope.meta.source?.identifier || profile.address
        const sourceIcon = getDefaultIconUrl(type)

        aggregator.push({
          claim,
          icon,
          address,
          type,
          masked,
          source,
          sourceIcon,
        })
      } else if (scopeValue === 'connected_accounts') {
        const profiles = connectedProfiles.filter((profile) =>
          scopeValues.claimValues[scopeValue].meta.urns.includes(profile.urn)
        )

        aggregator.push({
          claim: 'connected_accounts',
          accounts: profiles.map((profile) => {
            if (scopeValues.claimValues.email) {
              const { email } = scopeValues.claimValues
              const masked =
                email.claims.type === EmailAccountType.Mask &&
                profile.urn === email.meta.urns[0]
              if (masked) {
                const address = email.claims.email
                const source = email.meta?.source?.identifier
                return {
                  address,
                  source,
                  type: EmailAccountType.Mask,
                }
              }
            }
            return {
              icon: profile.icon,
              address: profile.address,
              type: profile.type === 'eth' ? 'blockchain' : profile.type,
            }
          }),
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
