export default /* GraphQL */ `
  type AuthorizationIdentity {
    identityURN: String
    name: String
    imageURL: String
  }

  type Query {
    getExternalAppData: JSON
    getAuthorizedIdentities(opts: Pagination!): [AuthorizationIdentity]
  }

  type Mutation {
    setExternalAppData(payload: JSON!): Boolean
  }
`
