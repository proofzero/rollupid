// function buildError(code: number, message: string) {
//   return new Error(`${code}: ${message}`)
// }

export type NFTarClientConfig = {
  key: string
  url: string
}

export class NFTarClient {
  #config: NFTarClientConfig

  constructor(config: NFTarClientConfig) {
    if (!config || !config.key || !config.url) {
      throw new Error(`500: Missing or malformed NFTar config: ${JSON.stringify(config)}`)
    }
    this.#config = config
  }

  // async getNFTs(params: GetNFTsParams): Promise<GetNFTsResult> {
  //   const url = this.getAPIURL('getNFTs/')

  //   url.searchParams.set('owner', params.owner)

  //   params.pageKey && url.searchParams.set('pageKey', params.pageKey)

  //   // Default and maximum page size is 100.
  //   params.pageSize &&
  //     url.searchParams.set('pageSize', params.pageSize.toString())

  //   if (params.contractAddresses) {
  //     params.contractAddresses.forEach((address) => {
  //       url.searchParams.append('contractAddresses[]', address)
  //     })
  //   }

  //   return fetch(url.toString())
  //     .then((r) => r.json())
  //     .catch((e) => {
  //       throw buildError(500, `Error calling Alchemy getNFTs: ${e.message}`)
  //     })
  // }

  // async getOwnersForToken(
  //   params: GetOwnersForTokenParams
  // ): Promise<GetOwnersForTokenResult | unknown> {
  //   const url = this.getAPIURL('getOwnersForToken/')

  //   const { contractAddress, tokenId } = params
  //   const urlSearchParams = new URLSearchParams({ contractAddress, tokenId })

  //   // Not currently tested. Was:
  //   // const response = await fetch(`${url}?${urlSearchParams}`)
  //   // const body: GetOwnersForTokenResult = await response.json()
  //   // return body
  //   return fetch(`${url}?${urlSearchParams}`)
  //     .then((r) => r.json())
  //     .catch((e) => {
  //       throw buildError(
  //         500,
  //         `Error calling Alchemy getOwnersForToken: ${e.message}`
  //       )
  //     })
  // }
}
