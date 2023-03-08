export type RollupAuth = {
  accessToken: string
  refreshToken: string
  extraParams: {
    scopes?: [string]
    redirect_uri?: string
  }
}

export type Chain = {
  chain: 'eth' | 'ethereum' | 'polygon'
  network: 'mainnet' | 'goerli' | 'mumbai'
}

export type Contract = {
  address: string
}

export type NftDetail = {
  isCopyable: boolean
  name: string
  value: string
}

export type NftProperty = {
  display: string
  name: string
  value: string
}

export type Gallery = {
  chain: Chain
  collectionTitle?: string
  contract: Contract
  details: Array<NftDetail>
  error: boolean
  properties?: Array<NftProperty>
  thumbnailUrl?: string
  title?: string
  tokenId: string
  url?: string
}

export type Link = {
  name?: string
  provider?: string
  url?: string
  verified?: boolean
}

export type FullProfile = {
  displayName: string
  pfp: {
    image: string
    isToken?: boolean
  }
  bio?: string
  job?: string
  location?: string
  website?: string
  links: Link[]
  gallery: Gallery[]
  handle?: string
  version: number
}
