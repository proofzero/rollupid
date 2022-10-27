export default /* GraphQL */ `
  interface Profile {
    id: ID
  }

  interface PFP {
    image: String
  }

  type StandardPFP implements PFP {
    image: String
  }

  type NFTPFP implements PFP {
    image: String
    isToken: Boolean
  }

  type ThreeIDProfile implements Profile {
    id: ID
    displayName: String
    pfp: PFP
    cover: String
    bio: String
    job: String
    location: String
    website: String
    addresses: [ThreeIDAddress!]
  }

  input PFPInput {
    image: String!
    isToken: Boolean
  }

  input ThreeIDProfileInput {
    displayName: String
    pfp: PFPInput
    cover: String
    bio: String
    job: String
    location: String
    website: String
  }

  type Query {
    profile: Profile!
    profileFromAddress(address: String!): Profile
  }

  type Mutation {
    updateThreeIDProfile(
      profile: ThreeIDProfileInput
      visibility: Visibility!
    ): Boolean
  }
`;
