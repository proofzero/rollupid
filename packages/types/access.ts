export type Scope = string[]

export enum GrantType {
  AuthenticationCode = 'authentication_code',
  AuthorizationCode = 'authorization_code',
  RefreshToken = 'refresh_token',
}

export enum ResponseType {
  Code = 'code',
}
