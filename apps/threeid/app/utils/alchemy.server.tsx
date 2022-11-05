export type GetNFTsResponse = {
  ownedNfts: {
    contract: {
      address: String
    }
    title: String
    description: String
    tokenUri: {
      raw: String
      gateway: String
    }
    media: {
      raw: String
      gateway: String
      thumbnail: String
      format: String
      bytes: Number
    }
    metadata: {
      image: String
      extneral_url: String
      background_color: String
      name: String
      description: String
      properties?: any
      attributes: Array<{ value: String; trait_type: String; display_type?: String }>
      media: {
        raw: String
        gateway: String
        thumbnail: String
        format: String
        bytes: Number
      }
      timeLastUpdated: Number
    },
    contractMetadata: {
      name: String,
      symbol: String,
      totalSupply: String,
      tokenType: String,
      openSeaObject: {
        floorPrice: String,
        collectionName: String,
        safeListRequestStatus: String,
        imageUrl: String,
        description: String,
        externalUrl: String,
        twitterUsername: String,
        discordUrl: String,
      }
    }
  }[]
  pageKey: String
  totalCount: String
  blockHash: String
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
    options?.withMetadata && reqUrl.searchParams.set('withMetadata', options.withMetadata.toString())

    console.log("requesting", reqUrl)
    const response = await fetch(reqUrl.toString(), {headers: {'accept': 'application/json'}})

    if (response.status !== 200) {
      throw new Error(`Failed to fetch NFTs with request: ${await response.text()}`)
    }

    return response.json()
  }
}
