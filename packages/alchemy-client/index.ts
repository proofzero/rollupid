function buildError(code: number, message: string) {
  return new Error(`${code}: ${message}`)
}

export type GetNFTsParams = {
  owner: string
  contractAddresses: string[]
  pageKey?: string
  pageSize?: number
}

export type GetNFTsResult = unknown

export type GetOwnersForTokenParams = {
  contractAddress: string
  tokenId: string
}

export type GetOwnersForTokenResult = {
  owners: string[]
}

enum AlchemyNetwork {
  mainnet = 'mainnet',
  goerli = 'goerli',
}

enum AlchemyChain {
  ethereum = 'eth',
}

export type AlchemyClientConfig = {
  key: string
  chain: AlchemyChain
  network: AlchemyNetwork
  url?: string
}

export class AlchemyClient {
  #config: AlchemyClientConfig

  getNFTAPIURL (path: string = '') {
    return new URL(path, `https://${this.#config.chain}-${this.#config.network}.g.alchemy.com/nft/v2/${this.#config.key}/`)
  }

  getAPIURL (path: string = '') {
    // Allow overriding the URL.
    if (this.#config.url) return new URL(path, this.#config.url)
    return new URL(path, `https://${this.#config.chain}-${this.#config.network}.g.alchemy.com/v2/${this.#config.key}/`)
  }

  constructor(config: AlchemyClientConfig) {
    if (!config || !config.key || !config.chain || !config.network) {
      throw buildError(500, `Missing or malformed Alchemy config: ${JSON.stringify(config)}`)
    }
    this.#config = config
  }

  async getNFTs (
    params: GetNFTsParams
  ): Promise<GetNFTsResult> {
    const url = this.getAPIURL('getNFTs/')

    url.searchParams.set('owner', params.owner)
  
    params.pageKey && url.searchParams.set('pageKey', params.pageKey)

    params.pageSize &&
      url.searchParams.set('pageSize', params.pageSize.toString())
  
    if (params.contractAddresses) {
      params.contractAddresses.forEach((address) => {
        url.searchParams.append('contractAddresses[]', address)
      })
    }

    const response = await fetch(url.toString())
    // const body = await response.json()
    
    return response.json()
  }
  
  async getOwnersForToken(
    params: GetOwnersForTokenParams
  ): Promise<GetOwnersForTokenResult> {
    const url = this.getAPIURL('/getOwnersForToken/')

    const { contractAddress, tokenId } = params
    const urlSearchParams = new URLSearchParams({ contractAddress, tokenId })
    const response = await fetch(`${url}?${urlSearchParams}`)
 
    const body: GetOwnersForTokenResult = await response.json()
    return body
  }
}