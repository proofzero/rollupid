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
  name: string
  accountURN: AccountURN
  timestamp: number
  imageURL: string
}
