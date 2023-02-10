import type { Profile } from '@kubelt/galaxy-client'

export enum RollType {
  RollAPIKey = 'roll_api_key',
  RollClientSecret = 'roll_app_secret',
}

export type RotatedSecrets = {
  rotatedApiKey: string
  rotatedClientSecret: string
}

export type AuthorizedProfile = {
  timestamp: number
  profile: Profile
  accountURN: string
}
