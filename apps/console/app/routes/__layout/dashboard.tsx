import { useNavigate, useOutletContext } from '@remix-run/react'
import AppBox from '~/components/AppBox'
import { InfoPanelDashboard } from '~/components/InfoPanel/InfoPanelDashboard'
import type { LoaderData as OutletContextData } from '~/root'

import folderPlus from '~/images/folderPlus.svg'

import { Button, Text } from '@proofzero/design-system'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { parseJwt, requireJWT } from '~/utilities/session.server'
import createCoreClient from '@proofzero/platform-clients/core'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import type { IdentityURN } from '@proofzero/urns/identity'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { redirect, type LoaderFunction } from '@remix-run/cloudflare'

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const jwt = await requireJWT(request, context.env)
    const traceHeader = generateTraceContextHeaders(context.traceSpan)
    const parsedJwt = parseJwt(jwt!)
    const identityURN = parsedJwt.sub as IdentityURN
    const coreClient = createCoreClient(context.env.Core, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })
    const spd = await coreClient.identity.getStripePaymentData.query({
      identityURN,
    })

    if (!spd?.email?.length) {
      return redirect('/onboarding')
    }
    return null
  }
)

export default () => {
  const navigate = useNavigate()
  const { apps, ENV } = useOutletContext<OutletContextData>()

  const GATag = ENV?.INTERNAL_GOOGLE_ANALYTICS_TAG

  return (
    <>
      {GATag && (
        <>
          {/* <!-- Event snippet for Sign-up conversion page -->  */}
          <script
            async
            dangerouslySetInnerHTML={{
              __html: `gtag('event', 'conversion', {'send_to': '${GATag}/x8scCNaPzMgYEPT6sYEq'});`,
            }}
          />
        </>
      )}
      <div className="mb-11">
        <InfoPanelDashboard />
      </div>

      {apps?.length > 0 && (
        <>
          <AppBox
            createLink="/dashboard/new"
            onCreate={() => {
              navigate('/apps/new')
            }}
            navigate={(clientId: string) => navigate(`/apps/${clientId}`)}
            apps={apps}
          />
        </>
      )}

      {apps?.length === 0 && (
        <>
          <Text size="base" weight="semibold" className="text-gray-900 mb-6">
            Your Applications
          </Text>

          <div className="text-center m-auto">
            <img
              className="inline-block mb-2"
              src={folderPlus}
              alt="Wallet icon"
            />

            <Text weight="semibold" className="text-gray-900">
              No Applications
            </Text>
            <Text weight="medium" className="text-gray-500 mb-6">
              Get started by creating an Application.
            </Text>

            <Button
              btnType="primary-alt"
              btnSize="l"
              onClick={() => {
                navigate('/apps/new')
              }}
            >
              Create Application
            </Button>
          </div>
        </>
      )}
    </>
  )
}
