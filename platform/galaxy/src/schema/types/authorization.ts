export default /* GraphQL */ `
  type Query {
    getExternalData: JSON
  }

  type Mutation {
    setExternalData(payload: JSON!): Boolean
  }
`
