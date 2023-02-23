/**
 * @file app/routes/dashboard/apps/$appId/index.tsx
 */
import { useEffect } from 'react'

import type { ActionFunction, LoaderFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'
import {
  useActionData,
  useOutletContext,
  useSubmit,
  useNavigate,
  useFetcher,
  useLoaderData,
} from '@remix-run/react'
import invariant from 'tiny-invariant'
import { ApplicationDashboard } from '~/components/Applications/Dashboard/ApplicationDashboard'
import createStarbaseClient from '@kubelt/platform-clients/starbase'
import { requireJWT } from '~/utilities/session.server'
import type { appDetailsProps } from '~/components/Applications/Auth/ApplicationAuth'
import { RollType } from '~/types'
import type { RotatedSecrets } from '~/types'
import { getAuthzHeaderConditionallyFromToken } from '@kubelt/utils'

// Component
// -----------------------------------------------------------------------------
/**
 * @file app/routes/dashboard/index.tsx
 */

type LoaderData = {
  clientId: string
}

export const loader: LoaderFunction = async ({ params }) => {
  const { clientId } = params

  if (!clientId) {
    throw new Error('clientId is required')
  }

  return json<LoaderData>({
    clientId,
  })
}

export const action: ActionFunction = async ({ request, params }) => {
  if (!params.clientId) {
    throw new Error('Application Client ID is required for the requested route')
  }

  const jwt = await requireJWT(request)
  const starbaseClient = createStarbaseClient(
    Starbase,
    getAuthzHeaderConditionallyFromToken(jwt)
  )

  const formData = await request.formData()
  const op = formData.get('op')
  invariant(op && typeof op === 'string', 'Operation should be a string')

  switch (op) {
    case RollType.RollAPIKey:
      const rotatedApiKey = (
        await starbaseClient.rotateApiKey.mutate({ clientId: params.clientId })
      ).apiKey
      return json({
        rotatedSecrets: { rotatedApiKey },
      })
    case RollType.RollClientSecret:
      const rotatedClientSecret = (
        await starbaseClient.rotateClientSecret.mutate({
          clientId: params.clientId,
        })
      ).secret
      return json({
        rotatedSecrets: { rotatedClientSecret },
      })
    default:
      throw new Error('Invalid operation')
  }
}

// Component
// -----------------------------------------------------------------------------

export default function AppDetailIndexPage() {
  const submit = useSubmit()
  const actionData = useActionData()
  const outletContext = useOutletContext<{
    appDetails: appDetailsProps
    rotationResult: RotatedSecrets
  }>()
  const { clientId } = useLoaderData()
  const authFetcher = useFetcher()
  const navigate = useNavigate()

  const { appDetails: app } = outletContext

  useEffect(() => {
    const query = new URLSearchParams()
    query.set('limit', '8')
    authFetcher.load(`/apps/${clientId}/users?${query}`)
  }, [])

  const { rotatedClientSecret, rotatedApiKey } =
    outletContext?.rotationResult ||
      actionData?.rotatedSecrets || {
        rotatedClientSecret: null,
        rotatedApiKey: null,
      }

  return (
    <ApplicationDashboard
      CTAprops={{
        clickHandler: () => {
          navigate('./auth')
        },
        CTAneeded: !app.app.icon || !app.app.redirectURI || !app.app.name,
      }}
      authorizedProfiles={authFetcher.data?.authorizedProfiles.users || []}
      error={authFetcher.data?.error || null}
      fetcherState={{
        loadingDetails: authFetcher.state,
        type: authFetcher.type,
      }}
      galaxyGql={{
        createdAt: new Date(app.apiKeyTimestamp as number),
        apiKey: rotatedApiKey as string,
        onKeyRoll: () => {
          submit(
            {
              op: RollType.RollAPIKey,
            },
            {
              method: 'post',
            }
          )
        },
      }}
      oAuth={{
        appId: app.clientId as string,
        appSecret: rotatedClientSecret as string,
        createdAt: new Date(app.secretTimestamp as number),
        onKeyRoll: () => {
          submit(
            {
              op: RollType.RollClientSecret,
            },
            {
              method: 'post',
            }
          )
        },
      }}
    />
  )
}
