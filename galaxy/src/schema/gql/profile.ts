export default /* GraphQL */ `
  type ThreeIDProfile {
    displayName: String
    avatar: String
    bio: String
    job: String
    location: String
    website: String
    addresses: [ThreeIDAddress!]
  }

  input ThreeIDProfileInput {
    id: ID!
    displayName: String
    avatar: String
    bio: String
    job: String
    location: String
    website: String
  }

  type Query {
    profile(id: ID): ThreeIDProfile
    profileFromAddress(address: String!): ThreeIDProfile
  }

  type Mutation {
    updateThreeIDProfile(
      profile: ThreeIDProfileInput
      visibility: Visibility!
    ): Boolean
  }
`;
