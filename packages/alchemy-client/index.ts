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
  address: string
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

export type GetNFTMedatadaParams = {
  contractAddress: string
  tokenId: string
}

export type GetNFTMedatadaResult = unknown

export type GetNFTMedatadaBatchParams = GetNFTMedatadaParams[]

export type GetNFTMedatadaBatchResult = unknown

export enum WebhookType {
  MINED_TRANSACTION = 'MINED_TRANSACTION',
  DROPPED_TRANSACTION = 'DROPPED_TRANSACTION',
  ADDRESS_ACTIVIY = 'ADDRESS_ACTIVIY',
  NFT_ACTIVIY = 'NFT_ACTIVIY',
  NFT_METADATA_UPDATE = 'NFT_METADATA_UPDATE',
}
export type CreateWebhookParams = {
  network: string
  webhookType: WebhookType
  webhookUrl: string
  app_id?: string
  addresses?: string[]
  nft_filters?: { contract_address: string; token_id: string }[]
  nft_metadata_filters?: { contract_address: string; token_id: string }[]
}

export type CreateWebhookResult = {
  data: {
    id: string
    network: AlchemyNetwork
    webhook_type: WebhookType
    webhook_url: string
    is_active: boolean
    time_created: number
    addresses: string[]
    version: string
    signing_key: string
  }
}

enum AlchemyNetwork {
  mainnet = 'mainnet',
  goerli = 'goerli',
  mumbai = 'mumbai',
}

export enum AlchemyChain {
  ethereum = 'eth',
  polygon = 'polygon',
}

export type AlchemyClientConfig = {
  key: string
  network: AlchemyNetwork
  chain?: AlchemyChain
  url?: string
  token?: string
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
      })
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
      })
  }

  async getOwnersForToken(
    params: GetOwnersForTokenParams
  ): Promise<GetOwnersForTokenResult | unknown> {
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
      })
  }
  async getNFTMetadataBatch(
    params: GetNFTMedatadaBatchParams
  ): Promise<GetNFTMedatadaBatchResult | unknown> {
    const url = this.getNFTAPIURL('getNFTMetadataBatch/')

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
    if (params?.length) {
      return fetch(urlStr, {
        method: 'POST',
        cf: {
          cacheTtl: 1500,
          cacheEverything: true,
          cacheKey,
        },
        body: JSON.stringify({
          tokens: params,
        }),
      })
        .then(async (r) => {
          if (r.status !== 200) {
            const errorText = await r.text()
            console.error(errorText)
            throw buildError(
              r.status,
              `Error calling Alchemy getNFTMetadataBatch: ${errorText}`
            )
          }
          return r.json()
        })
        .catch((e) => {
          throw buildError(
            e.status,
            `Error calling Alchemy getNFTMetadataBatch: ${e.message}`
          )
        })
    }
    return []
  }
}

export const NFTPropertyMapper = (nfts: any[]) =>
  nfts
    .filter((nft: any) => nft.contractMetadata?.tokenType !== 'UNKNOWN')
    .map((nft: any) => {
      let properties: {
        name: string
        value: any
        display: string
      }[] = []

      // TODO: is this here b/c pfp does not conform to standard?
      if (nft.metadata?.properties) {
        const validProps = Object.keys(nft.metadata.properties)
          .filter((k) => typeof nft.metadata.properties[k] !== 'object')
          .map((k) => ({
            name: k,
            value: nft.metadata.properties[k],
            display: typeof nft.metadata.properties[k],
          }))

        properties = properties.concat(validProps)
      }

      if (nft.metadata.attributes?.length) {
        const mappedAttributes = nft.metadata.attributes
          .filter((a: any) => a != null)
          .map((a: any) => ({
            name: a.trait_type,
            value: a.value,
            display: a.display_type || 'string',
          }))

        properties = properties.concat(mappedAttributes)
      }

      if (typeof nft.metadata === 'object') {
        nft.metadata.properties = properties.filter(
          (p) => typeof p.value !== 'object'
        )
      }
      if (nft.metadata.attributes) {
        delete nft.metadata.attributes
      }

      return nft
    })
