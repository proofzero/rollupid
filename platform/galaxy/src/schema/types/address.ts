export default /* GraphQL */ `
  type AddressProfile {
    id: String!
    type: String
    address: String
    title: String
    icon: String
  }

  input ConnectedAddressPropertiesUpdateInput {
    addressURN: String!
    public: Boolean
  }

  type Query {
    accountFromAlias(provider: String!, alias: String!): String!
    addressProfile(addressURN: String!): AddressProfile!
    addressProfiles(addressURNList: [String!]): [AddressProfile!]!
  }

  type Mutation {
    updateAddressNickname(addressURN: String!, nickname: String!): Boolean
    updateConnectedAddressesProperties(
      addressURNList: [ConnectedAddressPropertiesUpdateInput!]!
    ): Boolean
    registerSessionKey(
      sessionPublicKey: String!
      smartContractWalletAddress: String!
    ): String!
  }
`
