export default /* GraphQL */ `
  type AddressProfile {
    id: URN!
    type: String
    address: String
    title: String
    icon: String
  }

  input ConnectedAddressPropertiesUpdateInput {
    addressURN: URN!
    public: Boolean
  }

  input WhitelistInstance {
    to: String!
    selectors: [String!]!
  }

  type Query {
    accountFromAlias(provider: String!, alias: String!): URN!
    addressProfile(addressURN: URN!): AddressProfile!
    addressProfiles(addressURNList: [URN!]): [AddressProfile!]!
    registerSessionKey(
      accountUrn: String!
      sessionPublicKey: String!
      smartContractWalletAddress: String!
    ): String!
  }

  type Mutation {
    updateAddressNickname(addressURN: URN!, nickname: String!): Boolean
    updateConnectedAddressesProperties(
      addressURNList: [ConnectedAddressPropertiesUpdateInput!]!
    ): Boolean
  }
`
