export default /* GraphQL */ `
  type Query {
    getExternalData(clientId: String!): JSON
  }

  type Mutation {
    setExternalData(clientId: String!, externalData: JSON!): Boolean
  }
`
