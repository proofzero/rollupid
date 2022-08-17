// @ts-ignore
import sdkWeb from "../../../../packages/sdk-web/lib/com.kubelt.sdk.js";

import { ethers } from "ethers";
import { GenPfPReq, GenPfPRes } from "./types";

export const genPfP = async (
  provider: ethers.providers.Web3Provider,
  sdk: any
): Promise<GenPfPRes> => {
  let res: any;

  try {
    const signer = provider.getSigner();

    // Worth requerying the provider in case
    // accounts changed
    const address = await signer.getAddress();
    const network = await provider.getNetwork();

    const req: GenPfPReq = {
      account: address,
      blockchain: {
        name: `ethereum`,
        chainId: network.chainId,
      },
    };

    res = await sdkWeb.node_v1.oort.callRpc(sdk, {
      method: ["3id", "gen-pfp"],
      params: [req],
    });

    if (!res || res?.error || res?.body.error) {
      throw new Error();
    }

    res = res.body.result;
  } catch (e) {
    console.warn("Failed to generate PFP");
    res = null;
  }

  return res[0];
};
