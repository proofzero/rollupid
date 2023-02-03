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
    provider: String
  }

  type Profile {
    displayName: String
    pfp: PFP
    cover: String
    bio: String
    job: String
    location: String
    website: String
    handle: String
  }

  input PFPInput {
    image: String!
    isToken: Boolean
  }

  input LinkInput {
    name: String
    url: String
    verified: Boolean
    provider: String
  }

  input ProfileInput {
    displayName: String
    pfp: PFPInput
    cover: String
    bio: String
    job: String
    location: String
    website: String
  }

  type Query {
    profile: Profile
    links: [Link!]
    gallery: [Gallery!]
    connectedAddresses: [Node!]
    profileFromAddress(addressURN: URN!): Profile
    linksFromAddress(addressURN: URN!): [Link!]
    galleryFromAddress(addressURN: URN!): [Gallery!]
    connectedAddressesFromAddress(addressURN: URN!): [Node!]
  }

  type Mutation {
    updateProfile(profile: ProfileInput): Boolean
    updateLinks(links: [LinkInput!]): Boolean
    updateGallery(gallery: [GalleryInput!]): Boolean
  }
`
