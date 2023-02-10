export default `
  type AppUser {
    icon: String!
    title: String!
    timestamp: Float!
  }

  type Query {
    appUsers(clientId: String!): [AppUser!]!
  }
`
