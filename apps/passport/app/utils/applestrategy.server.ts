import type { StrategyVerifyCallback } from 'remix-auth'

import { OAuth2Strategy } from 'remix-auth-oauth2'
import type { OAuth2Profile, OAuth2StrategyVerifyParams } from 'remix-auth-oauth2'

export interface AppleStrategyOptions {
  clientID: string
  clientSecret: string
  callbackURL: string
  scope: string
}

export interface AppleExtraParams extends Record<string, string | number> {
  id_token: string
  expires_in: 3600
  token_type: 'Bearer'
}

export type AppleProfile = OAuth2Profile

export const AppleStrategyDefaultName = 'apple'

export class AppleStrategy<User> extends OAuth2Strategy<
  User,
  AppleProfile,
  AppleExtraParams
> {
  name = AppleStrategyDefaultName

  protected scope: string

  constructor(
    options: AppleStrategyOptions,
    verify: StrategyVerifyCallback<
      User,
      OAuth2StrategyVerifyParams<AppleProfile, AppleExtraParams>
    >
  ) {
    super(
      {
        authorizationURL: 'https://appleid.apple.com/auth/authorize',
        tokenURL: 'https://appleid.apple.com/auth/token',
        clientID: options.clientID,
        clientSecret: options.clientSecret,
        callbackURL: options.callbackURL,
      },
      verify
    )
    this.scope = options.scope
  }

  protected async userProfile(): Promise<AppleProfile> {
    return { provider: 'apple' }
  }

  protected authorizationParams() {
    return new URLSearchParams({
      response_mode: 'form_post',
      scope: this.scope,
    })
  }
}
