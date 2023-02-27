export default /* GraphQL */ `
  type Scope {
    permission: String!
    scopes: [String]!
  }

  type Query {
    scopes(clientId: String!): [Scope]!
  }

  type Mutation {
    revokeAuthorizations(clientId: String!, clientSecret: String!): Boolean
  }
`
