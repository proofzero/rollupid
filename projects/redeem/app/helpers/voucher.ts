import { gatewayFromIpfs } from "~/helpers/gateway-from-ipfs";

type FetchVoucherParams = {
  address: string;
  skipImage?: boolean;
};

export const fetchVoucher = async ({
  address,
  skipImage,
}: FetchVoucherParams) => {
  // @ts-ignore
  const nftarUrl = NFTAR_URL;
  // @ts-ignore
  const nftarToken = NFTAR_AUTHORIZATION;
  // @ts-ignore
  const contractAddress = MINTPFP_CONTRACT_ADDRESS;
  // @ts-ignore
  const chainId = NFTAR_CHAIN_ID;

  const nftarFetch = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${nftarToken}`,
    },
    body: JSON.stringify({
      id: 1,
      jsonrpc: "2.0",
      method: "3id_genPFP",
      params: {
        account: address,
        blockchain: {
          name: "ethereum",
          chainId,
        },
      },
    }),
  };

  const response = await fetch(
    `${nftarUrl}${skipImage ? "/?skipImage=true" : ""}`,
    nftarFetch
  );

  const jsonRes = await response.json();

  if (jsonRes.error) {
    console.log("Error fetching voucher", jsonRes.error);
    throw new Error(jsonRes.error.data.message);
  }

  if (skipImage) {
    return {
      contractAddress,
    };
  }

  let res = {
    ...jsonRes.result,
    contractAddress,
  };

  res.metadata.cover = gatewayFromIpfs(jsonRes.result.metadata.cover) as string;
  res.metadata.image = gatewayFromIpfs(jsonRes.result.metadata.image) as string;

  fetch(res.metadata.image);
  fetch(res.metadata.cover);

  return res;
};

export const getCachedVoucher = async (address: string) => {
  // @ts-ignore
  return VOUCHER_CACHE.get(address, { type: "json" });
};

export const putCachedVoucher = async (address: string, voucher: any) => {
  // @ts-ignore
  let cachedVoucher = await VOUCHER_CACHE.get(address, { type: "json" });
  if (!cachedVoucher) {
    cachedVoucher = {
      // @ts-ignore
      chainId: NFTAR_CHAIN_ID,
      // @ts-ignore
      contractAddress: MINTPFP_CONTRACT_ADDRESS,
      minted: false,
    };
  }

  const updatedVoucher = {
    ...cachedVoucher,
    ...voucher,
  };

  // @ts-ignore
  await VOUCHER_CACHE.put(address, JSON.stringify(updatedVoucher));

  return updatedVoucher;
};
