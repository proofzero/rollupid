import { type ToastType } from '@proofzero/design-system/src/atoms/toast'
import type {
  AuthorizedUser,
  AppObject,
  EdgesMetadata,
  CustomDomain,
  ExternalDataPackageDefinition,
} from '@proofzero/platform/starbase/src/types'
import { ServicePlanType } from '@proofzero/types/billing'
import { IdentityRefURN } from '@proofzero/urns/identity-ref'

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
  customDomain?: CustomDomain
  appPlan: ServicePlanType
  ownerURN: IdentityRefURN
  externalDataPackageDefinition?: ExternalDataPackageDefinition
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
  upsertAppContactAddress?: string
}

export type AuthorizedProfile = AuthorizedUser

export type edgesMetadata = EdgesMetadata
export type notificationHandlerType = (val: boolean) => void

export type ToastNotification = {
  message: string
  type: ToastType
}
