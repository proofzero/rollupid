export default /* GraphQL */ `
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

  interface Profile {
    displayName: String
    pfp: PFP
  }

  type DefaultProfile implements Profile {
    displayName: String
    pfp: PFP
    defaultAddress: URN
  }

  link {
    name: String
    url: String
  }


  type ThreeIDProfile implements Profile {
    displayName: String
    pfp: PFP
    cover: String
    bio: String
    job: String
    location: String
    website: String
    defaultAddress: URN
    addresses: [URN!]
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
    defaultAddress: URN
  }

  type Query {
    profile: Profile
    profileFromAddress(addressURN: URN!): Profile
  }

  type Mutation {
    updateThreeIDProfile(profile: ThreeIDProfileInput): Boolean
  }
`
