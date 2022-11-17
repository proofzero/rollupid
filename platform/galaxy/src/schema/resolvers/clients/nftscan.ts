type HeadersObject = {
  'X-API-KEY': string
}

export type NFTScanBinding = {
  fetch: (
    url: string,
    options: { method: string; headers: HeadersObject; body?: string }
  ) => Promise<Response>
}

export default class NFTScanClient {
  nftScan: NFTScanBinding
  baseURL: URL
  jwt: string | null

  constructor(nftScan: NFTScanBinding, jwt: string | null = null) {
    this.nftScan = nftScan
    this.baseURL = new URL('https://restapi.nftscan.com/api/')
    this.jwt = jwt
  }

  async send(url: URL): Promise<Response> {
    const headers: HeadersObject = {
      'X-API-KEY': 'whatever'
    }

    const request = new Request(
      url.href,
      {
        headers,
      }
    )

    //@ts-ignore
    const response = await this.nftScan.fetch(request)

    return response
  }

  async getTokensForAccount(address: string): Promise<Response> {
    const url = new URL(`/v2/account/own/${address}`, this.baseURL.href)
    return this.send(url)
  }
}
