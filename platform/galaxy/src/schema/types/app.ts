export default /* GraphQL */ `
  type Scope {
    permission: String!
    scopes: [String]!
  }

  type Query {
    scopes(clientId: String!): [Scope]!
  }

  type Mutation {
    revokeAppAuthorizations(clientId: String!): Boolean
  }
`
