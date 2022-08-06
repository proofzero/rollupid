// @ts-ignore
import sdkWeb from "../../../packages/sdk-web/lib/com.kubelt.sdk.js";

import { ethers } from "ethers";
import { hexlify } from "ethers/lib/utils";

import { BehaviorSubject } from "rxjs";
import Constants from "expo-constants";
import { Profile } from "../types/Profile";
import { Invitation } from "../types/Invitation.js";

// TODO: Split this file into multiple services, core, 3iD, mint etc.

let sdk: any = null;

const isAuthSubj = new BehaviorSubject(false);

/// AUTHENTICATION
const getSignFn = (
  address: string,
  provider: ethers.providers.Web3Provider
) => {
  return async (message: string): Promise<string> => {
    const signableBuffer = Buffer.from(message);
    const msgHash = hexlify(signableBuffer);

    const signed = await provider.send("personal_sign", [address, msgHash]);

    return signed;
  };
};

export const authenticate = async (
  provider: ethers.providers.Web3Provider,
  force: boolean = false
) => {
  const signer = provider.getSigner();
  const address = await signer.getAddress();

  const signFn = getSignFn(address, provider);

  let isAuth = isAuthSubj.getValue();

  try {
    if (!sdk) {
      sdk = await sdkWeb?.node_v1?.init({
        "oort/scheme": Constants.manifest?.extra?.oortSchema,
        "oort/host": Constants.manifest?.extra?.oortHost,
        "oort/port": Constants.manifest?.extra?.oortPort,
      });

      const restoredSdk = await sdkWeb?.node_v1?.restore(sdk);

      // We use isLoggedIn as a way to check if SDK
      // was persisted, as there is no other way;
      const isLoggedIn = await sdkWeb?.node_v1?.oort.isLoggedIn(
        restoredSdk,
        address
      );

      // If TRUE => SDK was persisted and is authenticated
      if (isLoggedIn) {
        sdk = restoredSdk;
        isAuth = true;
      } // IF FALSE => Either not authenticated or not persisted
    }

    isAuth = await isAuthenticated(address);
    if (force || !isAuth) {
      sdk = await sdkWeb?.node_v1?.oort.setWallet(sdk, {
        address,
        signFn,
      });

      sdk = await sdkWeb?.node_v1?.oort.authenticate(sdk, {
        "3id.profile": ["read", "write"],
      });

      isAuth = await isAuthenticated(address);
      if (isAuth) {
        await sdkWeb.node_v1.store(sdk);
      }
    }
  } catch (e) {
    isAuth = false;
    console.warn("There was a problem authenticating to the Kubelt SDK");
  }

  if (isAuth !== isAuthSubj.getValue()) {
    isAuthSubj.next(isAuth);
  }
};

export const isAuthenticated = async (address: string | null | undefined) => {
  if (!sdk || !address) {
    return false;
  }

  return sdkWeb?.node_v1?.oort.isLoggedIn(sdk, address);
};

export const kbGetClaims = async (): Promise<string[]> => {
  let claims: string[] = [];

  try {
    claims = (await sdkWeb?.node_v1?.oort.claims(sdk)) || [];
  } catch (e) {
    console.warn("Failed to get claims, falling back to empty array");
  }

  return claims;
};

/// INVITATIONS
export const threeIdListInvitations = async (): Promise<Invitation[]> => {
  let invites: Invitation[] = [];

  try {
    const res = await sdkWeb?.node_v1?.oort.callRpc(sdk, {
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

export const threeIdUseInvitation = async (
  contractAddress: string,
  tokenId: string
): Promise<boolean> => {
  let success = false;

  try {
    const res = await sdkWeb?.node_v1?.oort.callRpc(sdk, {
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

/// MINTING
export type PreMintRes =
  | {
      nftImageUrl: string;
      account: string;
      version: string;
      rarity: any; // not sure what it is yet, maybe number
    }
  | undefined;

export const threeIdGetPreMint = async (): Promise<PreMintRes> => {
  let preMint: PreMintRes;

  try {
    // const res = await sdkWeb?.node_v1?.oort.callRpc(sdk, {
    //   method: ["3id", "get-pre-mint"],
    //   params: [],
    // });

    // if (!res || res?.error || res?.body.error) {
    //   throw new Error();
    // }

    // preMint = res.body.result;

    preMint = {
      nftImageUrl: "https://picsum.photos/93",
      account: "0x6c60Da9471181Aa54C648c6e201263A5501363F3",
      rarity: 3,
      version: "GEN 0 - Mint green",
    };
  } catch (e) {
    console.warn("Failed to get pre-mint");
  }

  return preMint;
};

export const threeIdGetMintVoucher = async (): Promise<any> => {
  let voucher: any;

  try {
    // const res = await sdkWeb?.node_v1?.oort.callRpc(sdk, {
    //   method: ["3id", "get-mint-voucher"],
    //   params: [],
    // });

    // if (!res || res?.error || res?.body.error) {
    //   throw new Error();
    // }

    // voucher = res.body.result;
    voucher = {
      foo: "bar",
    };
  } catch (e) {
    console.warn("Failed to get mint voucher");
  }

  return voucher;
};

export const threeIdMint = async (voucher: any): Promise<boolean> => {
  let success: boolean;

  try {
    // const res = await sdkWeb?.node_v1?.oort.callRpc(sdk, {
    //   method: ["3id", "get-mint-voucher"],
    //   params: [],
    // });

    // if (!res || res?.error || res?.body.error) {
    //   throw new Error();
    // }

    // voucher = res.body.result;

    await new Promise((resolve) => setTimeout(resolve, 1216));
  } catch (e) {
    console.warn("Failed to get mint voucher");
  }

  return voucher;
};

/// PROFILE
export const kbGetProfile = async () => {
  const profile: Profile = await new Promise((resolve, reject) => {
    sdkWeb?.node_v1?.oort
      .callRpc(sdk, {
        method: ["kb", "get-profile"],
        params: [],
      })
      .then((x: any) => {
        if (x?.body?.error) {
          reject(x.body.error);
        } else {
          resolve(x?.body?.result);
        }
      });
  });
  return profile;
};

export const kbSetProfile = async (updatedProfile: Profile) => {
  const profile = await new Promise((resolve, reject) => {
    sdkWeb?.node_v1?.oort
      .callRpc(sdk, {
        method: ["kb", "set-profile"],
        params: { profile: updatedProfile },
      })
      .then((x: any) => {
        if (x?.body?.error) {
          reject(x.body.error);
        } else {
          resolve(x?.body?.result);
        }
      });
  });
  return profile;
};

// STORAGE

export const store = async (ns: string, path: string, data: any) => {
  let storedObject: any;

  try {
    const res = await sdkWeb?.node_v1?.oort.callRpc(sdk, {
      method: ["kb", "set-data"],
      params: [ns, path, JSON.stringify(data)],
    });

    if (!res || res?.error || res?.body.error) {
      throw new Error();
    }

    storedObject = res.body.result;
  } catch (e) {
    console.warn("Failed to store data");
  }

  return storedObject;
};

export const retrieve = async (ns: string, path: string): Promise<any> => {
  let storedObject: any;

  try {
    const res = await sdkWeb?.node_v1?.oort.callRpc(sdk, {
      method: ["kb", "get-data"],
      params: [ns, path],
    });

    if (!res || res?.error || res?.body.error) {
      throw new Error();
    }

    storedObject = res.body.result;
  } catch (e) {
    console.warn("Failed to retrieve data");
  }

  return storedObject;
};

/// UTILS
export const purge = () => {
  sdk = null;
  localStorage.clear();
  isAuthSubj.next(false);
};

export const getIsAuthObs = () => isAuthSubj.asObservable();

export type FunnelState = {
  mint: boolean;
  invite: boolean;
};

export const tickFunnelStep = async (step: keyof FunnelState) => {
  let funnelState: FunnelState = {
    mint: false,
    invite: false,
  };

  const storedFunnelState = await retrieve("3id.profile", "funnel-state");
  if (storedFunnelState?.value) {
    funnelState = JSON.parse(storedFunnelState.value);
  }

  funnelState[step] = true;

  await store("3id.profile", "funnel-state", funnelState);
};

export const getFunnelState = async (): Promise<FunnelState> => {
  const funnelState = await retrieve("3id.profile", "funnel-state");
  const funnelRes: FunnelState = JSON.parse(funnelState?.value) ?? {
    invite: false,
    mint: false,
  };

  console.log(funnelRes);

  return funnelRes;
};
