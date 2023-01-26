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

  type Link {
    name: String
    url: String
    verified: Boolean
  }

  type Profile {
    displayName: String
    defaultAddress: URN
    pfp: PFP
    cover: String
    bio: String
    job: String
    location: String
    links: [Link!]
    website: String
    addresses: [Node!]
    handle: String
    gallery: [Gallery!]
  }

  input PFPInput {
    image: String!
    isToken: Boolean
  }

  input LinkInput {
    name: String
    url: String
    verified: Boolean
  }

  input ProfileInput {
    displayName: String
    pfp: PFPInput
    cover: String
    bio: String
    job: String
    location: String
    website: String
    defaultAddress: URN
    links: [LinkInput]
    addresses: [NodeInput!]
    gallery: [GalleryInput!]
  }

  type Query {
    profile: Profile
    profileFromAddress(addressURN: URN!): Profile
    connectedAddresses: [Node!]
  }

  type Mutation {
    updateProfile(profile: ProfileInput): Boolean
  }
`
