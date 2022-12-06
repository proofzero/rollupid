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

export type GetContractsForOwnerParams = {
  owner: string
  pageKey?: string
  pageSize?: number
  excludeFilters?: string[]
}

export type GetContractsForOwnerResult = unknown

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
  mumbai = 'mumbai',
}

enum AlchemyChain {
  ethereum = 'eth',
  polygon = 'polygon',
}

export type AlchemyClientConfig = {
  key: string
  chain: AlchemyChain
  network: AlchemyNetwork
  url?: string
}

export class AlchemyClient {
  #config: AlchemyClientConfig

  getNFTAPIURL(path = '') {
    return new URL(
      path,
      `https://${this.#config.chain}-${
        this.#config.network
      }.g.alchemy.com/nft/v2/${this.#config.key}/`
    )
  }

  getAPIURL(path = '') {
    // Allow overriding the URL.
    if (this.#config.url) return new URL(path, this.#config.url)
    return new URL(
      path,
      `https://${this.#config.chain}-${this.#config.network}.g.alchemy.com/v2/${
        this.#config.key
      }/`
    )
  }

  constructor(config: AlchemyClientConfig) {
    if (!config || !config.key || !config.chain || !config.network) {
      throw buildError(
        500,
        `Missing or malformed Alchemy config: ${JSON.stringify(config)}`
      )
    }
    this.#config = config
  }

  async getNFTs(params: GetNFTsParams): Promise<GetNFTsResult> {
    const url = this.getAPIURL('getNFTs/')

    url.searchParams.set('owner', params.owner)

    params.pageKey && url.searchParams.set('pageKey', params.pageKey)

    // Default and maximum page size is 100.
    params.pageSize &&
      url.searchParams.set('pageSize', params.pageSize.toString())

    if (params.contractAddresses) {
      params.contractAddresses.forEach((address) => {
        url.searchParams.append('contractAddresses[]', address)
      })
    }

    return fetch(url.toString())
      .then(async (r) => {
        if (r.status !== 200) {
          const errorText = await r.text()
          console.error(errorText)
          throw buildError(
            r.status,
            `Error calling Alchemy getNFTs: ${errorText}`
          )
        }
        return r.json()
      })
      .catch((e) => {
        throw buildError(
          e.status,
          `Error calling Alchemy getNFTs: ${e.message}`
        )
      })
  }

  async getContractsForOwner(
    params: GetContractsForOwnerParams
  ): Promise<GetContractsForOwnerResult> {
    const url = this.getAPIURL('getContractsForOwner/')

    url.searchParams.set('owner', params.owner)

    params.pageKey && url.searchParams.set('pageKey', params.pageKey)

    // Default and maximum page size is 100.
    params.pageSize &&
      url.searchParams.set('pageSize', params.pageSize.toString())

    // To exclude spam or airdrop
    params.excludeFilters &&
      params.excludeFilters.forEach((filter) =>
        url.searchParams.set('excludeFilters', filter)
      )

    return fetch(url.toString())
      .then(async (r) => {
        if (r.status !== 200) {
          const errorText = await r.text()
          console.error(errorText)
          throw buildError(
            r.status,
            `Error calling Alchemy getContractsForOwner: ${errorText}`
          )
        }
        return r.json()
      })
      .catch((e) => {
        throw buildError(
          e.status,
          `Error calling Alchemy getContractsForOwner: ${e.message}`
        )
      })
  }

  async getOwnersForToken(
    params: GetOwnersForTokenParams
  ): Promise<GetOwnersForTokenResult | unknown> {
    const url = this.getAPIURL('getOwnersForToken/')

    const { contractAddress, tokenId } = params
    const urlSearchParams = new URLSearchParams({ contractAddress, tokenId })

    // Not currently tested. Was:
    // const response = await fetch(`${url}?${urlSearchParams}`)
    // const body: GetOwnersForTokenResult = await response.json()
    // return body
    return fetch(`${url}?${urlSearchParams}`)
      .then(async (r) => {
        if (r.status !== 200) {
          const errorText = await r.text()
          console.error(errorText)
          throw buildError(
            r.status,
            `Error calling Alchemy getOwnersForToken: ${errorText}`
          )
        }
        return r.json()
      })
      .catch((e) => {
        throw buildError(
          500,
          `Error calling Alchemy getOwnersForToken: ${e.message}`
        )
      })
  }
}
