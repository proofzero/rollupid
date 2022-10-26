export default /* GraphQL */ `
  query getProfile {
    profile {
      avatar,
      cover,
      isToken,
      displayName,
      location,
      job,
      bio,
      website
    }
  },
  query getProfileFromAddress($address: String!) {
    profileFromAddress(address: $address) {
      displayName
      avatar
      cover
      isToken
      bio
      job
      location
      website
    }
  }
`;
