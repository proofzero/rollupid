import type { AccountURN } from '@kubelt/urns/account'
import type { ScopeDescriptor } from '@kubelt/security/scopes'

export type AppCreateResult = {
  account: AccountURN
  clientId: string
  clientName: string
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
