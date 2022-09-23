import { LoaderFunction, redirect } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { oortSend } from "~/utils/rpc.server";
import { getUserSession } from "~/utils/session.server";

type LoadVoucherParams = {
  address: string;
  chainId: string;
};

const gatewayFromIpfs = (ipfsUrl: string | undefined): string | undefined => {
  const regex = /(bafy\w*)/;
  const matches = regex.exec(ipfsUrl as string);

  return matches
    ? `https://nftstorage.link/ipfs/${matches[0]}/threeid.png`
    : undefined;
};

const loadVoucher = async ({ address, chainId }: LoadVoucherParams) => {
  // @ts-ignore
  const nftarUrl = NFTAR_URL;
  // @ts-ignore
  const nftarToken = NFTAR_AUTHORIZATION;
  // @ts-ignore
  const contractAddress = MINTPFP_CONTRACT_ADDRESS;

  const response = await fetch(`${nftarUrl}`, {
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
  });

  const jsonRes = await response.json();
  if (jsonRes.error) {
    throw new Error(jsonRes.error.data.message);
  }

  let res = {
    ...jsonRes.result,
    contractAddress
  };

  res.metadata.image = gatewayFromIpfs(jsonRes.result.metadata.image) as string

  fetch(res.metadata.image)

  return res;
};

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const chainId = url.searchParams.get("chainId");
  const session = await getUserSession(request);

  if (!session || !session.has("jwt") || !chainId) {
    return json(null, {
      status: 500,
    });
  }

  const jwt = session.get("jwt");
  const address = session.get("address");

  // @ts-ignore
  const cachedVoucher = await VOUCHER_CACHE.get(address, { type: "json" });
  try {
    const voucher = await loadVoucher({ address, chainId })

    if (cachedVoucher) {
      return json({
        minted: false,
        ...cachedVoucher
      });
    } else {
      // @ts-ignore
      await VOUCHER_CACHE.put(address, JSON.stringify(voucher));

      const data = await oortSend(
        "kb_setData",
        [
          "3id.profile",
          "pfp",
          {
            url: voucher.imgUrl,
            contractAddress: null,
            isToken: false,
          },
        ],
        {
          jwt,
          cookie: request.headers.get("Cookie") as string | undefined,
        }
      );
    
      if (data.error) {
        throw new Error("Unable to persist pfp data");
      }

      return json({
        minted: false,
        ...voucher
      });
    }
  } catch (ex) {
    return json({
      minted: true,
      //@ts-ignore
       ...(cachedVoucher || JSON.parse(STATIC_VOUCHER))
    });
  }
};
