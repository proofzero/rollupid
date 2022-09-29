export const gatewayFromIpfs = (
  ipfsUrl: string | undefined
): string | undefined => {
  if (!ipfsUrl?.startsWith("ipfs://")) return ipfsUrl;

  const regex = /(bafy\w*)/;
  const matches = regex.exec(ipfsUrl as string);

  return matches
    ? `https://nftstorage.link/ipfs/${matches[0]}${
        ipfsUrl.split(matches[0])[1]
      }`
    : undefined;
};
