import type createStarbaseClient from '@kubelt/platform-clients/starbase'

export const RollType = {
  RollAPIKey: 'roll_api_key',
  RollClientSecret: 'roll_app_secret',
  RollBothSecrets: 'roll_both',
} as const

export type RotatedSecrets = {
  rotatedApiKey: string | null
  rotatedClientSecret: string | null
}

export default async function rotateSecrets(
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
