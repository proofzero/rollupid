import { FullProfile } from '~/types'

export type ProfileCompletionStatus = {
  base: boolean
  links: boolean
  connections: boolean
  gallery: boolean
}

export const determineProfileCompletionStatus = (
  profile: FullProfile
): ProfileCompletionStatus => {
  let base = false
  if (
    profile.bio &&
    profile.cover &&
    profile.job &&
    profile.location &&
    profile.website
  ) {
    base = true
  }

  const links = profile.links?.length > 0
  const connections = profile.addresses.length > 1
  const gallery = profile.gallery.length > 0

  return {
    base,
    links,
    connections,
    gallery,
  }
}
