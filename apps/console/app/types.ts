import type { AccountURN } from '@kubelt/urns/account'

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
  name?: string
  imageURL?: string
  accountURN: AccountURN
}
