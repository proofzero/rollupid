export default /* GraphQL */ `
  type ExchangeTokenResult {
    accessToken: String!
    refreshToken: String!
  }

  enum GrantType {
    authentication_code
    authorization_code
    refresh_token
  }

  input Token {
    iss: String!
    token: String!
  }

  input AuthenticationTokenInput {
    grantType: GrantType!
    code: String!
    redirectUri: String!
    clientId: String!
  }

  input AuthorizationTokenInput {
    grantType: GrantType!
    code: String!
    redirectUri: String!
    clientId: String!
    clientSecret: String!
    scopes: [String]
  }

  input RefreshTokenInput {
    grantType: GrantType!
    token: Token!
  }

  type Mutation {
    exchangeAuthorizationToken(
      exchange: AuthorizationTokenInput!
    ): ExchangeTokenResult
    exchangeRefreshToken(exchange: RefreshTokenInput!): ExchangeTokenResult
  }
`
