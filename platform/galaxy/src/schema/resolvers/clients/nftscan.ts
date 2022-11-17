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

  async send(
  ): Promise<Response> {
    const id = method
      .replace(/^.+_/, '')
      .replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())

    const headers: HeadersObject = {
      'X-API-KEY': 'whatever'
    }

    if (this.jwt) {
      headers['KBT-Access-JWT-Assertion'] = this.jwt
    }
    if (options?.route?.address) {
      headers['KBT-Core-Address'] = options.route.address
    }

    const request = new Request(
      //@ts-ignore
      `https://127.0.0.1/jsonrpc`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          id,
          jsonrpc: '2.0',
          method,
          params,
        }),
      }
    )

    //@ts-ignore
    const response = await this.oort.fetch(request)

    return response
  }

  async getTokensForAccount(address: string): Promise<Response> {
    const url = new URL(`/v2/account/own/${address}`, this.baseURL)
    return this.send(url)
  }
}
