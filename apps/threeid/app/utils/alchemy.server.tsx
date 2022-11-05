export type NFTMedia = {
  raw: string
  gateway: string
  thumbnail: string
  format: string
  bytes: number
}
export type GetNFTsResponse = {
  ownedNfts: {
    contract: {
      address: string
    }
    title: string
    description: string
    tokenUri: {
      raw: string
      gateway: string
    }
    media: NFTMedia | NFTMedia[]
    metadata: {
      image: string
      external_url: string
      background_color: string
      name: string
      description: string
      properties?: any
      attributes: Array<{ value: string; trait_type: string; display_type?: string }>
      media: NFTMedia | NFTMedia[]
      timeLastUpdated: number
    },
    contractMetadata: {
      name: string,
      symbol: string,
      totalSupply: string,
      tokenType: string,
      openSeaObject: {
        floorPrice: string,
        collectionName: string,
        safeListRequestStatus: string,
        imageUrl: string,
        description: string,
        externalUrl: string,
        twitterUsername: string,
        discordUrl: string,
      }
    }
  }[]
  pageKey: string
  totalCount: string
  blockHash: string
}

export class AlchemyClient {
  constructor() {}

  async getNFTsForOwner(
    address: string,
    options?: {
      contracts?: string[] | null,
      pageKey?: string | null,
      withMetadata?: boolean | null,
    }
  ): Promise<GetNFTsResponse> {
    // @ts-ignore
    const reqUrl = new URL(`${ALCHEMY_NFT_API_URL}/getNFTs`)
    reqUrl.searchParams.set('owner', address)
    options?.contracts && reqUrl.searchParams.set('contractAddresses', options.contracts.join(','))
    options?.pageKey && reqUrl.searchParams.set('pageKey', options.pageKey)
    options?.withMetadata && reqUrl.searchParams.set('withMetadata', options.withMetadata.tostring())

    const response = await fetch(reqUrl.toString(), {headers: {'accept': 'application/json'}})

    if (response.status !== 200) {
      throw new Error(`Failed to fetch NFTs with request: ${await response.text()}`)
    }

    return response.json()
  }
}
