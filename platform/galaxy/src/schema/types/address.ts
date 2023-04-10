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

  type Query {
    accountFromAlias(provider: String!, alias: String!): URN!
    addressProfile(addressURN: URN!): AddressProfile!
    addressProfiles(addressURNList: [URN!]): [AddressProfile!]!
  }

  type Mutation {
    updateAddressNickname(addressURN: URN!, nickname: String!): Boolean
    updateConnectedAddressesProperties(
      addressURNList: [ConnectedAddressPropertiesUpdateInput!]!
    ): Boolean
  }
`
