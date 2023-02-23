export default /* GraphQL */ `
  type Scope {
    key: String!
    value: String!
  }

  type Query {
    scopes(clientId: String!): [Scope]!
  }
`
