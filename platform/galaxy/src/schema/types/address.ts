export default /* GraphQL */ `
  type Query {
    ensDisplayName(addressOrEns: String!): String
    ensAddress(addressOrEns: String!): String
    ensAddressAvatar(addressOrEns: String!): String
    connectedAddresses(addressURN: URN!): [URN]
  }
`
