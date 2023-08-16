export default /* GraphQL */ `
  type AccountProfile {
    id: String!
    type: String
    address: String
    title: String
    icon: String
  }

  input ConnectedAccountPropertiesUpdateInput {
    accountURN: String!
    public: Boolean
  }

  type Query {
    identityFromAlias(provider: String!, alias: String!): String!
    accountProfile(accountURN: String!): AccountProfile!
    accountProfiles(accountURNList: [String!]): [AccountProfile!]!
  }

  type Mutation {
    updateAccountNickname(accountURN: String!, nickname: String!): Boolean
    updateConnectedAccountsProperties(
      accountURNList: [ConnectedAccountPropertiesUpdateInput!]!
    ): Boolean
    registerSessionKey(
      sessionPublicKey: String!
      smartContractWalletAccount: String!
    ): String!
  }
`
