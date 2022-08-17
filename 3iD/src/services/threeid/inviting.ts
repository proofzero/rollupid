// @ts-ignore
import sdkWeb from "../../../../packages/sdk-web/lib/com.kubelt.sdk.js";

import { Invitation } from "./types";

export const listInvitations = async (sdk: any): Promise<Invitation[]> => {
  let invites: Invitation[] = [];

  try {
    const res = await sdkWeb.node_v1.oort.callRpc(sdk, {
      method: ["3id", "list-invitations"],
      params: [],
    });

    if (!res || res?.error || res?.body?.error) {
      throw new Error();
    }

    // Might want to do a check here
    invites = res.body.result;
  } catch (e) {
    console.warn("Failed to get invites, falling back to empty array");
  }

  return invites;
};

export const claimInvitation = async (
  sdk: any,
  contractAddress: string,
  tokenId: string
): Promise<boolean> => {
  let success = false;

  try {
    const res = await sdkWeb.node_v1.oort.callRpc(sdk, {
      method: ["3id", "redeem-invitation"],
      params: [contractAddress, tokenId],
    });

    if (!res || res?.error || res?.body.error) {
      throw new Error();
    }

    success = res.body.result;
  } catch (e) {
    console.warn("Failed to redeem invitation");
  }

  return success;
};
