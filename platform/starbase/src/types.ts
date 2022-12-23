import type { AccountURN } from '@kubelt/urns/account'
import type { ScopeDescriptor } from '@kubelt/security/scopes'

export type AppCreateResult = {
  account: AccountURN
  clientId: string
  clientName: string
}

export type AppUpdateRequestParams = {
  clientId: string
  updates: {
    name: string
    icon?: string
    redirectURI?: string
    termsURL?: string
    websiteURL?: string
    mirrorURL?: string
    discordUser?: string
    mediumUser?: string
    twitterUser?: string
  }
}

export type AppPublishRequestParams = {
  clientId: string
  published: boolean
}

export type AppProfileResult = object

export type AppScopesResult = {
  scopes: Record<string, ScopeDescriptor>
}

export type AppAuthCheckParams = {
  redirectURI: string
  scopes: string[]
  clientId: string
  clientSecret?: string
}

export type AppRotateSecretResult = {
  secret: string
}

export type AppApiKeyCheckParams = [key: AppAPIKeyValidityRequest]

export type AppAPIKeyValidityResult = {
  valid: boolean
}

export type AppAPIKeyValidityRequest = {
  apiKey: string
}

export type AppAPIKeyResult = {
  apiKey: string
}
