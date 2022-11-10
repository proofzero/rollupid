export const gatewayFromIpfs = (
  ipfsUrl: string | undefined
): string | undefined => {
  const regex = /ipfs:\/\/?(?:ipfs)?\/(?<cid>\w+)\/?(?<path>.+)$/
  const match = ipfsUrl?.match(regex)

  if (!ipfsUrl || !match) return ipfsUrl

  return `https://${match[1]}.ipfs.nftstorage.link/${match[2]}`
}
