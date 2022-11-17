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

  requestFactory(_url: URL): Request {
    const headers: HeadersObject = {
      'X-API-KEY': this.nftScanAPIKey
    }
    return new Request(
      _url.href,
      {
        headers,
      }
    )
  }

  async send(url: URL): Promise<Response> {
    return fetch(this.requestFactory(url))
  }

  async getTokensForAccount(address: string): Promise<Response> {
    const url = new URL(`/v2/account/own/${address}`, this.baseURL.href)
    return this.send(url)
  }
}
