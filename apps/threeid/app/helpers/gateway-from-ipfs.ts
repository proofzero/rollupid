export const gatewayFromIpfs = (
  ipfsUrl: string | undefined
): string | undefined => {
  if (!ipfsUrl?.startsWith('ipfs://')) return ipfsUrl

  let resLocation = ipfsUrl.replace('ipfs://', '')

  return resLocation.startsWith('ipfs')
    ? `https://nftstorage.link/${resLocation}`
    : `https://nftstorage.link/ipfs/${resLocation}`
}
