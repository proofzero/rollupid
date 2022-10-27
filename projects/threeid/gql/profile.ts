export default /* GraphQL */ `
  query getProfile {
    profile {
      ... on ThreeIDProfile {
        pfp {
          ... on StandardPFP {
            image
          }
          ... on NFTPFP {
            image
            isToken
          }
        }
        cover
        displayName
        location
        job
        bio
        website
      }
    }
  }
  query getProfileFromAddress($address: String!) {
    profileFromAddress(address: $address) {
      ... on ThreeIDProfile {
        pfp {
          ... on StandardPFP {
            image
          }
          ... on NFTPFP {
            image
            isToken
          }
        }
        cover
        displayName
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
