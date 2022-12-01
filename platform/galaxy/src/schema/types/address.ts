export default /* GraphQL */ `
  type Query {
    address(address: URN!): URN
    addresses: [URN]
  }

  type Mutation {
    updateThreeIDAddress(address: URN!): URN
  }
`
