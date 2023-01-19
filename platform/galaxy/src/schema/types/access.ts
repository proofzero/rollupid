export default /* GraphQL */ `
  type ExchangeTokenResult {
    accessToken: String!
    refreshToken: String!
  }

  input ExchangeTokenInput {
    grantType: String!
    account: URN
    code: String
    redirectUri: String
    clientId: String
    clientSecret: String
    token: String
  }

  type Mutation {
    exchangeToken(exchange: ExchangeTokenInput): ExchangeTokenResult
  }
`
