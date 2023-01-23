/**
 * @file app/routes/dashboard/apps/$appId/index.tsx
 */

import type { ActionFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'
import { useActionData, useOutletContext, useSubmit } from '@remix-run/react'
import invariant from 'tiny-invariant'
import { ApplicationDashboard } from '~/components/Applications/Dashboard/ApplicationDashboard'
import createStarbaseClient from '@kubelt/platform-clients/starbase'
import { requireJWT } from '~/utilities/session.server'
import { PlatformJWTAssertionHeader } from '@kubelt/types/headers'
import type { appDetailsProps } from '~/components/Applications/Auth/ApplicationAuth'

// Component
// -----------------------------------------------------------------------------
/**
 * @file app/routes/dashboard/index.tsx
 */

export const action: ActionFunction = async ({ request, params }) => {
  if (!params.clientId) {
    throw new Error('Application client id is required for the requested route')
  }

  const jwt = await requireJWT(request)
  const starbaseClient = createStarbaseClient(Starbase, {
    headers: {
      [PlatformJWTAssertionHeader]: jwt,
    },
  })

  const formData = await request.formData()
  const op = formData.get('op')
  invariant(op && typeof op === 'string', 'Operation should be a string')

  const rotationResult = await rotateSecrets(
    starbaseClient,
    params.clientId,
    op
  )
  return json({
    rotatedSecrets: rotationResult,
  })
}

const RollType = {
  RollAPIKey: 'roll_api_key',
  RollClientSecret: 'roll_app_secret',
  RollBothSecrets: 'roll_both',
} as const

type RotatedSecrets = {
  rotatedApiKey: string | null
  rotatedClientSecret: string | null
}

async function rotateSecrets(
  starbaseClient: ReturnType<typeof createStarbaseClient>,
  clientId: string,
  op: string
): Promise<RotatedSecrets> {
  let result: RotatedSecrets = {
    rotatedApiKey: null,
    rotatedClientSecret: null,
  }

  if (op === RollType.RollAPIKey || op === RollType.RollBothSecrets)
    result.rotatedApiKey = (
      await starbaseClient.rotateApiKey.mutate({ clientId })
    ).apiKey

  if (op === RollType.RollClientSecret || op === RollType.RollBothSecrets) {
    const response = await starbaseClient.rotateClientSecret.mutate({
      clientId,
    })
    result.rotatedClientSecret = response.secret.split(':')[1]
  }

  return result
}

// Component
// -----------------------------------------------------------------------------

export default function AppDetailIndexPage() {
  const submit = useSubmit()
  const actionData = useActionData()
  const outletContext =
    useOutletContext<{
      appDetails: appDetailsProps
      rotationResult: RotatedSecrets
    }>()

  const { appDetails: app } = outletContext

  const { rotatedClientSecret, rotatedApiKey } =
    outletContext?.rotationResult ||
      actionData?.rotatedSecrets || {
        rotatedClientSecret: null,
        rotatedApiKey: null,
      }

  return (
    <ApplicationDashboard
      galaxyGql={{
        createdAt: new Date(app.apiKeyTimestamp?.toString() as string),
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
        createdAt: new Date(app.secretTimestamp?.toString() as string),
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
