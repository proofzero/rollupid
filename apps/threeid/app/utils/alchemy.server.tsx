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
      attributes: Array<{ value: String; trait_type: String }>
      media: {
        raw: String
        gateway: String
        thumbnail: String
        format: String
        bytes: Number
      }
      timeLastUpdated: Number
    }
  }[]
  pageKey: String
  totalCount: String
  blockHash: String
}

export class AlchemyClient {
  constructor() {}

  async getNFTsForOwner(
    contract: string,
    address: string
  ): Promise<GetNFTsResponse> {
    const response = await fetch(
      `${ALCHEMY_NFT_API_URL}/getNFTs${new URLSearchParams({
        owner: address,
        contractAddresses: [contract].join(','),
      })}`
    )

    if (response.status !== 200) {
      throw new Error('Failed to fetch NFTs')
    }

    return response.json()
  }
}
