export default /* GraphQL */ `
  type CryptoAddressProfile {
    address: String!
    avatar: String
    displayName: String
  }

  type OAuthGoogleProfile {
    sub: String
    name: String
    given_name: String
    family_name: String
    picture: String!
    email: String
    email_verified: Boolean
    locale: String
  }

  type OAuthGithubProfile {
    login: String!
    id: Int
    avatar_url: String!
    html_url: String
    name: String
    email: String
    bio: Boolean
    location: String
    followers: Int
    following: Int
    public_repos: Int
    public_gists: Int
  }

  type OAuthTwitterProfile {
    id: Int
    name: String
    screen_name: String!
    profile_image_url_https: String!
  }

  type OAuthMicrosoftProfile {
    sub: String
    name: String
    given_name: String
    family_name: String
    email: String
    picture: String!
  }

  type OAuthAppleProfile {
    email: String
    name: String
    picture: String!
    sub: String
  }

  type OAuthDiscordProfile {
    id: String
    email: String
    username: String
    discriminator: String
    avatar: String
  }

  union AddressProfilesUnion =
      CryptoAddressProfile
    | OAuthGoogleProfile
    | OAuthGithubProfile
    | OAuthTwitterProfile
    | OAuthMicrosoftProfile
    | OAuthAppleProfile
    | OAuthDiscordProfile

  type AddressProfile {
    urn: URN!
    type: String!
    profile: AddressProfilesUnion!
  }

  input ConnectedAddressPropertiesUpdateInput {
    addressURN: URN!
    public: Boolean
  }

  type Query {
    ensProfile(addressOrEns: String!): CryptoAddressProfile!
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
