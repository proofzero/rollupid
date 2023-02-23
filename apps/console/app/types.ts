import type {
  AuthorizedUser,
  AuthorizedAccountsOutput,
} from '@kubelt/platform/starbase/src/types'

export enum RollType {
  RollAPIKey = 'roll_api_key',
  RollClientSecret = 'roll_app_secret',
}

export type RotatedSecrets = {
  rotatedApiKey: string
  rotatedClientSecret: string
}

export type AuthorizedProfile = AuthorizedUser

export type edgesMetadata = AuthorizedAccountsOutput['metadata']
