function buildError(code: number, message: string) {
  return new Error(`${code}: ${message}`)
}

// --------------------- HELPERS -----------------------------------------------

export enum AlchemyNetwork {
  mainnet = 'mainnet',
  goerli = 'goerli',
  mumbai = 'mumbai',
}

export enum AlchemyChain {
  ethereum = 'eth',
  polygon = 'polygon',
}

enum TokenType {
  Erc721 = 'ERC721',
  Erc1155 = 'ERC1155',
  Unknown = 'UNKNOWN',
}

enum OpenSeaSafeListStatus {
  Approved = 'approved',
  NotRequested = 'not_requested',
  Requested = 'requested',
  Verified = 'verified',
}

export type OpenSea = {
  floorPrice?: number | null
  collectionName?: string | null
  safeListRequestStatus?: OpenSeaSafeListStatus | null
  imageUrl?: string | null
  description?: string | null
  externalUrl?: string | null
  twitterUsername?: string | null
  discordUrl?: string | null
  lastIngestedAt?: string | null
}

export type NFTMedia = {
  raw: string
  bytes?: number | null
  format?: string | null
  gateway?: string | null
  thumbnail?: string | null
}

export type AlchemyContract = {
  address: string
  totalBalance: number
  numDistinctTokensOwned: number
  isSpam: boolean
  tokenId: string
  name: string
  title: string
  symbol: string
  tokenType: TokenType
  contractDeployer: string
  deployedBlockNumber: number
  media: NFTMedia
  opensea: OpenSea
}

export type AlchemyNFT = {
  contract: { address: string }
  id: { tokenId: string }
  balance: string
  title?: string | null
  description?: string | null
  tokenUri: {
    raw: string
    gateway?: string | null
  }
  media: NFTMedia
  metadata: {
    image?: string | null
    external_url?: string | null
    background_color?: string | null
    name?: string | null
    description?: string | null
    attributes?: {
      value: string
      trait_type: string
    }[]
    media: NFTMedia
  }
  timeLastUpdated: string
  error?: string | null
  contractMetadata: {
    name?: string | null
    symbol: string
    totalSupply: string
    tokenType: TokenType
    contractDeployer: string
    deployedBlockNumber: number
    opensea?: OpenSea | null
  }
  spamInfo?: { isSpam: string; classifications: string[] } | null
}

// --------------------- PARAMS ------------------------------------------------

export type GetNFTsParams = {
  owner: string
  contractAddresses: string[]
  pageKey?: string
  pageSize?: number
}

export type GetOwnersForTokenParams = {
  contractAddress: string
  tokenId: string
}

export type GetContractsForOwnerParams = {
  address: string
  pageKey?: string
  pageSize?: number
  excludeFilters?: string[]
}

// --------------------- RESULTS -----------------------------------------------

export type GetNFTsResult = {
  ownedNfts: AlchemyNFT[]
  pageKey?: string | null
  tokenId: string
  blockHash: string
}

export type GetContractsForOwnerResult = {
  contracts: AlchemyContract[]
  pageKey?: string | null
  totalCount: string
}

export type GetOwnersForTokenResult = {
  owners: string[]
}

export type AlchemyClientConfig = {
  key: string
  network: AlchemyNetwork
  chain: AlchemyChain
  url?: string
  token?: string
}

// --------------------- MAIN FUNCTIONALITY ------------------------------------
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

  getChain() {
    return {
      chain: this.#config.chain,
      network: this.#config.network,
    }
  }

  constructor(config: AlchemyClientConfig) {
    if (!config || (!config.key && !config.token) || !config.network) {
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

    // Is supported ONLY on ethereum and polygon mainnets
    // !! Doesn't work for goerly, mumbai etc and almost anything else !!
    // https://docs.alchemy.com/reference/getspamcontracts
    ;['SPAM'].forEach((filter) => {
      url.searchParams.append('excludeFilters[]', filter)
    })

    const urlStr = url.toString()

    const cacheKeyDigest = await crypto.subtle.digest(
      {
        name: 'SHA-256',
      },
      new TextEncoder().encode(urlStr)
    )
    const cacheKeyArray = Array.from(new Uint8Array(cacheKeyDigest))
    const cacheKey = cacheKeyArray
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
    return fetch(urlStr, {
      cf: {
        cacheTtl: 1500,
        cacheEverything: true,
        cacheKey,
      },
    })
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
      }) as Promise<GetNFTsResult>
  }

  async getContractsForOwner(
    params: GetContractsForOwnerParams
  ): Promise<GetContractsForOwnerResult> {
    const url = this.getNFTAPIURL('getContractsForOwner/')

    url.searchParams.set('owner', params.address)

    params.pageKey && url.searchParams.set('pageKey', params.pageKey)

    // Default and maximum page size is 100.
    params.pageSize &&
      url.searchParams.set('pageSize', params.pageSize.toString())

    // To exclude spam or airdrop
    if (params.excludeFilters) {
      params.excludeFilters.forEach((filter) => {
        url.searchParams.append('excludeFilters[]', filter)
      })
    }

    const urlStr = url.toString()

    const cacheKeyDigest = await crypto.subtle.digest(
      {
        name: 'SHA-256',
      },
      new TextEncoder().encode(urlStr)
    )
    const cacheKeyArray = Array.from(new Uint8Array(cacheKeyDigest))
    const cacheKey = cacheKeyArray
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
    return fetch(urlStr, {
      cf: {
        cacheTtl: 1500,
        cacheEverything: true,
        cacheKey,
      },
    })
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
      }) as Promise<GetContractsForOwnerResult>
  }

  async getOwnersForToken(
    params: GetOwnersForTokenParams
  ): Promise<GetOwnersForTokenResult> {
    const url = this.getAPIURL('getOwnersForToken/')

    const { contractAddress, tokenId } = params

    url.searchParams.set('contractAddress', contractAddress)
    url.searchParams.set('tokenId', tokenId.toString())

    // Not currently tested. Was:
    // const response = await fetch(`${url}?${urlSearchParams}`)
    // const body: GetOwnersForTokenResult = await response.json()
    // return body

    const urlStr = url.toString()
    const cacheKeyDigest = await crypto.subtle.digest(
      {
        name: 'SHA-256',
      },
      new TextEncoder().encode(urlStr)
    )
    const cacheKeyArray = Array.from(new Uint8Array(cacheKeyDigest))
    const cacheKey = cacheKeyArray
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
    return fetch(urlStr, {
      cf: {
        cacheTtl: 1500,
        cacheEverything: true,
        cacheKey,
      },
    })
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
      }) as Promise<GetOwnersForTokenResult>
  }
}
