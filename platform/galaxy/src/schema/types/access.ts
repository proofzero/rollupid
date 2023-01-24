export default /* GraphQL */ `
  type ExchangeTokenResult {
    accessToken: String!
    refreshToken: String!
  }

  input ExchangeTokenInput {
    grantType: String!
    code: String!
    redirectUri: String!
    clientId: String!
    clientSecret: String!
    scopes: [String]
  }

  type Mutation {
    exchangeToken(exchange: ExchangeTokenInput!): ExchangeTokenResult
  }
`
