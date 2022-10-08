export default /* GraphQL */ `
  query getProfile {
    profile {
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
      bio
      job
      location
      website
    }
  }
`;
