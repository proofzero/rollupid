type GetNFTsParams = {
  owner: string
  contractAddresses: string[]
  pageKey?: string
  pageSize?: number
}

type GetNFTsResult = unknown

type GetOwnersForTokenParams = {
  contractAddress: string
  tokenId: string
}

type GetOwnersForTokenResult = {
  owners: string[]
}

const NFT_API_URL = process.env.ALCHEMY_NFT_API_URL

export const getNFTs = async (
  params: GetNFTsParams
): Promise<GetNFTsResult> => {
  const url = new URL(`${NFT_API_URL}/getNFTs/`)
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
  const body = await response.json()
  return body
}

export const getOwnersForToken = async (
  params: GetOwnersForTokenParams
): Promise<GetOwnersForTokenResult> => {
  const url = new URL(`${NFT_API_URL}/getOwnersForToken/`)
  const { contractAddress, tokenId } = params
  const urlSearchParams = new URLSearchParams({ contractAddress, tokenId })
  const response = await fetch(`${url}?${urlSearchParams}`)
  const body: GetOwnersForTokenResult = await response.json()
  return body
}
