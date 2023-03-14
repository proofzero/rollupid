import type { AuthorizedUser } from '@kubelt/platform/starbase/src/types'
import type { EdgesMetadata } from '@kubelt/platform/starbase/src/types'

export enum RollType {
  RollAPIKey = 'roll_api_key',
  RollClientSecret = 'roll_app_secret',
}

export type RotatedSecrets = {
  rotatedApiKey: string
  rotatedClientSecret: string
}

export type appDetailsProps = {
  app: {
    name: string
    scopes: string[]
    icon?: string
    redirectURI?: string
    termsURL?: string
    websiteURL?: string
    twitterUser?: string
    mediumUser?: string
    mirrorURL?: string
    discordUser?: string
  }
  published?: boolean
  clientId?: string
  secretTimestamp?: number
  apiKeyTimestamp?: number
}

export type errorsAuthProps = {
  websiteURL?: string
  termsURL?: string
  redirectURI?: string
  icon?: string
  name?: string
  discordUser?: string
  twitterUser?: string
  mediumUser?: string
  mirrorURL?: string
}

export type AuthorizedProfile = AuthorizedUser

export type edgesMetadata = EdgesMetadata
