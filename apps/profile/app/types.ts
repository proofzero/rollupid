import type { Gallery, Link, Profile, Node } from '@kubelt/galaxy-client'

export type RollupAuth = {
  accessToken: string
  refreshToken: string
  extraParams: {
    scopes?: [string]
    redirect_uri?: string
  }
}

export type FullProfile = Profile & {
  links: Link[]
  gallery: Gallery[]
  addresses: Node[]
  pfp: {
    image: string
    isToken?: boolean
  }
}
