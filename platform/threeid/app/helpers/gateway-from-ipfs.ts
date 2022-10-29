export const gatewayFromIpfs = (
  ipfsUrl: string | undefined
): string | undefined => {
  if (!ipfsUrl?.startsWith("ipfs://")) return ipfsUrl;

  const resLocation = ipfsUrl.replace("ipfs://", "");

  return `https://nftstorage.link/ipfs/${resLocation}`;
};
