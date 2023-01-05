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

  type link {
    name: String
    url: String
  }

  type DefaultProfile implements Profile {
    displayName: String
    pfp: PFP
    defaultAddress: URN
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
    links: [link]
  }

  input PFPInput {
    image: String!
    isToken: Boolean
  }

  input linkInput {
    name: String
    url: String
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
    links: [linkInput]
  }

  type Query {
    profile: Profile
    profileFromAddress(addressURN: URN!): Profile
  }

  type Mutation {
    updateThreeIDProfile(profile: ThreeIDProfileInput): Boolean
  }
`
