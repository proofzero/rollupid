type NftarTrait = {
  type: string
  value: {
    rnd: number[]
    name: string
    rgb: {
      r: number
      g: number
      b: number
    }
  }
}

export type NftarVoucher = {
  recipient: string
  uri: string
  metadata: {
    name: string
    description: string
    cover: string
    image: string
    external_url: string
    properties: {
      metadata: {
        blockchain: {
          properties: {
            name: string
            chain: string
          }
        }
      }
      traits: {
        trait0: NftarTrait
        trait1: NftarTrait
        trait2: NftarTrait
        trait3: NftarTrait
      }
    }
  }
}

export type CryptoAddressProfile = {
  address: string
  avatar?: string | null
  displayName?: string | null
  nftarVoucher?: NftarVoucher
}
