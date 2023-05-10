import type {
  AuthorizedUser,
  AppObject,
  EdgesMetadata,
} from '@proofzero/platform/starbase/src/types'

export enum RollType {
  RollAPIKey = 'roll_api_key',
  RollClientSecret = 'roll_app_secret',
}

export type RotatedSecrets = {
  rotatedApiKey: string
  rotatedClientSecret: string
}

export type appDetailsProps = {
  app: AppObject
  published?: boolean
  clientId?: string
  secretTimestamp?: number
  apiKeyTimestamp?: number
}

export type errorsAuthProps = {
  websiteURL?: string
  termsURL?: string
  privacyURL?: string
  redirectURI?: string
  icon?: string
  name?: string
  paymaster?: string
}

export type errorsTeamProps = {
  upserteAppContactAddress?: string
}

export type AuthorizedProfile = AuthorizedUser

export type edgesMetadata = EdgesMetadata
export type notificationHandlerType = (val: boolean) => void
