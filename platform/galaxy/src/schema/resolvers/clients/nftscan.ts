import { Token } from 'graphql'
import { TokenType } from  '../typedefs'

type HeadersObject = {
  'X-API-KEY': string
}

export default class NFTScanClient {
  nftScanAPIKey: string
  baseURL: URL
  jwt: string | null

  constructor(nftScanAPIKey: string, jwt: string | null = null) {
    this.nftScanAPIKey = nftScanAPIKey
    this.baseURL = new URL('https://restapi.nftscan.com/api/')
    this.jwt = jwt
  }

  requestFactory(url: URL): Request {
    const headers: HeadersObject = {
      'X-API-KEY': this.nftScanAPIKey
    }

    return new Request(
      url.href,
      {
        headers,
      }
    )
  }

  async send(url: URL): Promise<Response> {
    return fetch(this.requestFactory(url))
  }

  async getTokensForAccount(address: string): Promise<Response> {
    const url = new URL(`v2/account/own/${address}`, this.baseURL.href)
    url.searchParams.append('erc_type', TokenType.Erc721)
    // url.searchParams.append('erc_type', TokenType.Erc1155)
    // url.searchParams.append('contract_address', contract_address)
    // url.searchParams.append('cursor', next)
    // url.searchParams.append('limit', 1000) // default 1000
    url.searchParams.append('show_attribute', 'true') // default false    
    // TODO: Pagination and 1155s
    return this.send(url)
      .then(r => r?.json())
      .then(r => r?.data)
  }
}
