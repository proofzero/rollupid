export default /* GraphQL */ `
  type StandardPFP {
    image: String
  }

  type NFTPFP {
    image: String
    isToken: Boolean
  }

  type Link {
    name: String
    url: String
    verified: Boolean
    provider: String
  }

  type App {
    clientId: String!
    icon: String!
    title: String!
    timestamp: Float!
  }

  union PFP = StandardPFP | NFTPFP

  type Profile {
    displayName: String
    pfp: PFP
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
    bio: String
    job: String
    location: String
    website: String
  }

  type Query {
    profile(targetAccountURN: URN): Profile
    links(targetAccountURN: URN): [Link!]
    gallery(targetAccountURN: URN): [Gallery!]
    connectedAddresses(targetAccountURN: URN): [Node!]
    authorizedApps: [App]
  }

  type Mutation {
    updateProfile(profile: ProfileInput!): Boolean
    updateLinks(links: [LinkInput!]!): Boolean
    updateGallery(gallery: [GalleryInput!]!): Boolean
    disconnectAddress(addressURN: URN!): Boolean
  }
`
