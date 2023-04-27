import { LoaderFunction } from '@remix-run/cloudflare'
import { useLoaderData, useOutletContext } from '@remix-run/react'

import { loader as scopesLoader } from './scopes'
import { AuthorizedAppsModel } from '~/routes/settings'
import { Button, Text } from '@proofzero/design-system'
import { FaChevronRight } from 'react-icons/fa'
import { GetAuthorizedAppScopesMethodResult } from '@proofzero/platform/access/src/jsonrpc/methods/getAuthorizedAppScopes'

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

export default () => {
  const { clientId } = useLoaderData()
  const { authorizedApps } = useOutletContext<{
    authorizedApps: AuthorizedAppsModel[]
  }>()

  const app = authorizedApps.find((app) => app.clientId === clientId)!
  const { scopes } = useLoaderData<{
    scopes: GetAuthorizedAppScopesMethodResult[]
  }>()

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

      <section className="bg-white gap-5 flex flex-row items-center">
        <img src={app.icon} className="w-12 h-12 rounded-lg" />

        <Text size="lg" weight="semibold" className="text-gray-900">
          {app.title}
        </Text>
      </section>

      <section>{JSON.stringify(scopes, null, 2)}</section>
    </>
  )
}
