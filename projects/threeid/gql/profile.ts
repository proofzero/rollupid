export default /* GraphQL */ `
  query getProfile {
    profile {
      displayName
    }
  }
  query getProfileFromAddress($address: String!) {
    profileFromAddress(address: $address) {
      displayName
      pfp {
        ... on StandardPFP {
          image
        }
        ... on NFTPFP {
          image
          isToken
        }
      }
      ... on ThreeIDProfile {
        cover
        location
        job
        bio
        website
      }
    }
  }
  mutation updateProfile(
    $profile: ThreeIDProfileInput
    $visibility: Visibility!
  ) {
    updateThreeIDProfile(profile: $profile, visibility: $visibility)
  }
`;
