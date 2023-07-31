export default /* GraphQL */ `
  type StandardPFP {
    image: String
  }

  type NFTPFP {
    image: String
    isToken: Boolean
  }

  type App {
    clientId: String!
    icon: String!
    title: String!
    timestamp: Float!
  }

  union PFP = StandardPFP | NFTPFP

  type Profile {
    displayName: String
    pfp: PFP
  }

  input PFPInput {
    image: String!
    isToken: Boolean
  }

  input ProfileInput {
    displayName: String
    pfp: PFPInput
  }

  type Query {
    profile(targetIdentityURN: String): Profile
    connectedAccounts(targetIdentityURN: String): [Node!]
    authorizedApps: [App]
  }

  type Mutation {
    disconnectAccount(accountURN: String!): Boolean
  }
`
