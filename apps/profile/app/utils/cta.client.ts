import type { FullProfile } from '~/types'

export type ProfileCompletionStatus = {
  base: boolean
  links: boolean
  connections: boolean
  gallery: boolean
}

export const determineProfileCompletionStatus = (
  profile: FullProfile,
  addresses: any[]
): ProfileCompletionStatus => {
  let base = true

  const links = profile.links?.length > 0
  const gallery = profile.gallery?.length > 0
  const connections = addresses.length > 1

  return {
    base,
    links,
    connections,
    gallery,
  }
}
