import { MIN } from "@datadog/datadog-api-client/dist/packages/datadog-api-client-v1/models/FormulaAndFunctionEventAggregation";
import { LoaderFunction, redirect } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { oortSend } from "~/utils/rpc.server";
import { getUserSession } from "~/utils/session.server";

type LoadVoucherParams = {
  address: string;
  skipImage?: boolean;
};

const gatewayFromIpfs = (ipfsUrl: string | undefined): string | undefined => {
  const regex = /(bafy\w*)/;
  const matches = regex.exec(ipfsUrl as string);

  return matches
    ? `https://nftstorage.link/ipfs/${matches[0]}/threeid.png`
    : undefined;
};

const loadVoucher = async ({ address, skipImage }: LoadVoucherParams) => {
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
  }
  
  const response = await fetch(`${nftarUrl}${skipImage ? "/?skipImage=true": ''}`, nftarFetch);

  const jsonRes = await response.json();

  if (jsonRes.error) {
    throw new Error(jsonRes.error.data.message);
  }

  if (skipImage) {
    return {
      contractAddress
    };
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
  const session = await getUserSession(request);

  // TODO: remove chain id and redirect to /auth
  if (!session || !session.has("jwt")) {
    return json(null, {
      status: 500,
    });
  }

  const jwt = session.get("jwt");
  const address = session.get("address");

  // @ts-ignore
  const cachedVoucher = await VOUCHER_CACHE.get(address, { type: "json" });

  try {
    const voucher = await loadVoucher({ address, skipImage: !!cachedVoucher });
    
    if (cachedVoucher) {
      return json({
        minted: false,
        //@ts-ignore
        chainId: NFTAR_CHAIN_ID,
        ...cachedVoucher,
        //@ts-ignore
        contractAddress: MINTPFP_CONTRACT_ADDRESS,
      });
    } else {
      // @ts-ignore
      await VOUCHER_CACHE.put(address, JSON.stringify(voucher));

      const data = await oortSend(
        "kb_putObject",
        [
          "3id.profile",
          "pfp",
          {
            url: voucher.metadata.image,
            cover: voucher.metadata.cover,
            //@ts-ignore
            contractAddress: MINTPFP_CONTRACT_ADDRESS,
            isToken: false,
          },
          {
            visibility: "public"
          }
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
        //@ts-ignore
        chainId: NFTAR_CHAIN_ID,
        ...voucher
      });
    }
  } catch (ex) {
    // remove the voucher info to remove chances of reminting
    delete cachedVoucher["voucher"];
    return json({
      minted: true,
      //@ts-ignore
      chainId: NFTAR_CHAIN_ID,
       ...cachedVoucher
    });
  }
};
