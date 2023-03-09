import type {
  AlchemyChain,
  AlchemyNetwork,
} from '@kubelt/packages/alchemy-client'

export type RollupAuth = {
  accessToken: string
  refreshToken: string
  extraParams: {
    scopes?: [string]
    redirect_uri?: string
  }
}

// -------------------------- NFTs ---------------------------------------------

export type Chain = {
  chain: AlchemyChain
  network: AlchemyNetwork
}

export type Contract = {
  address: string
}

export type NFTDetail = {
  isCopyable: boolean
  name: string
  value: string
}

export type NFTProperty = {
  display: string
  name: string
  value: string
}

export type NFT = {
  url?: string | null
  thumbnailUrl?: string | null
  title?: string | null
  contract: Contract
  tokenId: string
  chain: Chain
  collectionTitle?: string | null
  properties?: NFTProperty[] | null
  details: NFTDetail[]
}

// -------------------------- Profile ------------------------------------------
export type Gallery = NFT[]

export type Link = {
  name?: string
  provider?: string
  url?: string
  verified?: boolean
}

export type Links = Link[]

export type FullProfile = {
  displayName: string
  pfp: {
    image: string
    isToken?: boolean
  }
  job?: string
  location?: string
  links: Links
  gallery: Gallery
  handle?: string
  version: number
}
