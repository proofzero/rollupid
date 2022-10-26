import { LoaderFunction, json } from "@remix-run/cloudflare";
import { gatewayFromIpfs } from "~/helpers/gateway-from-ipfs";

export const loader: LoaderFunction = async ({ request }) => {
  const srcUrl = new URL(request.url);

  // @ts-ignore
  const url = new URL(`${ALCHEMY_NFT_API_URL}/getNFTs/`);

  const owner = srcUrl.searchParams.get("owner");
  if (!owner) {
    throw new Error("Owner required");
  }

  url.searchParams.set("owner", owner);

  const pageKey = srcUrl.searchParams.get("pageKey");
  if (pageKey) {
    url.searchParams.set("pageKey", pageKey);
  }

  const req = await fetch(url.toString());

  let res = await req.json();
  res.ownedNfts = res.ownedNfts.map(
    (nft: {
      title: string,
      media: [
        {
          gateway: string;
          raw: string;
        }
      ],
      contractMetadata?: {
        name: string;
      }
    }) => ({
      url: gatewayFromIpfs(nft.media[0].raw),
      title: nft.title,
      collectionTitle: nft.contractMetadata?.name
    })
  );

  return json(res);
};
