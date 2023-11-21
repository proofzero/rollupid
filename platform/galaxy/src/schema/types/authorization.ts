export default /* GraphQL */ `
  type Query {
    getExternalAppData: JSON
  }

  type Mutation {
    setExternalAppData(payload: JSON!): Boolean
  }
`
