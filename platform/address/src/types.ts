import { z } from 'zod'

import { Scope } from '@proofzero/types/access'

import { OAuthDataSchema } from './jsonrpc/validators/oauth'

export interface Challenge {
  address: string
  template: string
  redirectUri: string
  scope: Scope
  state: string
  timestamp: number
}

export interface AddressProfile<Type = string> {
  type: Type
  address: string
  title: string
  icon?: string
  disconnected?: boolean
}

export type AddressProfiles = AddressProfile[]

export type OAuthData = z.infer<typeof OAuthDataSchema>

export interface GitHubOAuthProfile {
  login: string
  name: string
  avatar_url: string
}

export interface AppleOAuthProfile {
  email: string
  name: string
  picture: string
}

export interface DiscordOAuthProfile {
  id: string
  username: string
  discriminator: string
  avatar: string
}

export interface GoogleOAuthProfile {
  email: string
  name: string
  picture: string
}

export interface MicrosoftOAuthProfileCommon {
  email: string
}

export interface MicrosoftOAuthProfilePersonal
  extends MicrosoftOAuthProfileCommon {
  givenname: string
  familyname: string
}

export interface MicrosoftOAuthProfileWork extends MicrosoftOAuthProfileCommon {
  name: string
  given_name: string
  family_name: string
}

export type MicrosoftOAuthProfile =
  | MicrosoftOAuthProfilePersonal
  | MicrosoftOAuthProfileWork

export interface TwitterOAuthProfile {
  name: string
  screen_name: string
  profile_image_url_https: string
}

export enum ReferenceType {
  Authorization = 'authorization',
  DevNotificationsEmail = 'developerNotificationsEmail',
  BillingEmail = 'billingEmail',
}
