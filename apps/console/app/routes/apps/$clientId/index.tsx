/**
 * @file app/routes/dashboard/apps/$appId/index.tsx
 */

import { ActionFunction, json, LoaderFunction } from '@remix-run/cloudflare'
import { useActionData, useLoaderData, useSubmit } from '@remix-run/react'
import invariant from 'tiny-invariant'
import { ApplicationDashboard } from '~/components/Applications/Dashboard/ApplicationDashboard'
import { getStarbaseClient, StarbaseClient } from '~/utilities/platform.server'
import { requireJWT } from '~/utilities/session.server'

// Component
// -----------------------------------------------------------------------------
/**
 * @file app/routes/dashboard/index.tsx
 */

export const loader: LoaderFunction = async ({ request, params }) => {
  if (!params.clientId) {
    throw new Error('Application client id is required for the requested route')
  }

  const jwt = await requireJWT(request)
  const starbaseClient = getStarbaseClient(jwt)
  const appDetails = (await starbaseClient.kb_appDetails(params.clientId)) as {
    appId: string
    clientId: string
    secretTimestamp?: number
    apiKeyTimestamp?: number
    app: {
      timestamp: number
      title: string
    }
  }
  
  let rotationResult
  //If there's no timestamps, then the secrets have never been set, signifying the app
  //has just been created; we rotate both secrets and set the timestamps
  if (!appDetails.secretTimestamp && !appDetails.apiKeyTimestamp) {
    rotationResult = await rotateSecrets(starbaseClient, params.clientId, RollType.RollBothSecrets);
    appDetails.secretTimestamp = appDetails.apiKeyTimestamp = Date.now()
  }

  return json({
    app: appDetails,
    rotatedSecrets: rotationResult
  })
}


export const action: ActionFunction = async ({ request, params }) => {
  if (!params.clientId) {
    throw new Error('Application client id is required for the requested route')
  }

  const jwt = await requireJWT(request)
  const starbaseClient = getStarbaseClient(jwt)

  const formData = await request.formData()
  const op = formData.get('op')
  invariant(op && typeof op === 'string', "Operation should be a string")

  const rotationResult = await rotateSecrets(starbaseClient, params.clientId, op)
  return json({ 
    rotatedSecrets: rotationResult
  })
}

const RollType = {
  RollAPIKey: 'roll_api_key',
  RollClientSecret: 'roll_app_secret',
  RollBothSecrets: 'roll_both'
} as const

type RotatedSecrets = {
  rotatedApiKey: string | null,
  rotatedClientSecret: string | null
}

async function rotateSecrets(starbaseClient: StarbaseClient, clientId: string, op: string): Promise<RotatedSecrets> {
  let result: RotatedSecrets = {
    rotatedApiKey: null,
    rotatedClientSecret: null
  }

  if (op === RollType.RollAPIKey || op === RollType.RollBothSecrets)
    result.rotatedApiKey = (await starbaseClient.kb_appRotateApiKey({ clientId: clientId})).apiKey

  if (op === RollType.RollClientSecret || op === RollType.RollBothSecrets)
    result.rotatedClientSecret = (await starbaseClient.kb_appRotateSecret(clientId)).secret.split(":")[1]

  return result

}

// Component
// -----------------------------------------------------------------------------

export default function AppDetailIndexPage() {
  const { app } = useLoaderData()
  const submit = useSubmit()
  const { rotatedClientSecret, rotatedApiKey } = 
    useLoaderData()?.rotatedSecrets || useActionData()?.rotatedSecrets || { rotatedClientSecret: null, rotatedApiKey: null}
  
    return (
    <ApplicationDashboard
      galaxyGql={{
        createdAt: new Date(app.apiKeyTimestamp),
        apiKey: rotatedApiKey,
        onKeyRoll: () => {
          submit(
            {
              op: RollType.RollAPIKey
            },
            {
              method: 'post'
            }
          )
        },
      }}
      oAuth={{
        appId: app.appId,
        appSecret: rotatedClientSecret,
        createdAt: new Date(app.secretTimestamp),
        onKeyRoll: () => {
          submit(
            {
              op: RollType.RollClientSecret
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
