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

export const threeIdGetEns = async (): Promise<string[]> => {
  let ens: string[] = [];

  try {
    // const res = await sdkWeb?.node_v1?.oort.callRpc(sdk, {
    //   method: ["3id", "get-ens"],
    //   params: [],
    // });

    // if (!res || res?.error || res?.body.error) {
    //   throw new Error();
    // }

    // ens = res.body.result;

    await new Promise((resolve) => setTimeout(resolve, 1216));
  } catch (e) {
    console.warn("Failed to get ens");
  }

  return ens;
};

/// MINTING
export type GenPfPReq = {
  account: string;
  blockchain: {
    name: string;
    chainId: number;
  };
};

export type GenPfPResTraits = {
  [key: string]: {
    type: string;
    value: {
      name: string;
      rgb: {
        r: number;
        g: number;
        b: number;
      };
      rnd: number[];
    };
  };
};

export type GenPfPRes =
  | {
      metadata: {
        name: string;
        description: string;
        properties: {
          account: string;
          blockchain: {
            name: string;
            chainId: number;
          };
          traits: GenPfPResTraits;
        };

        /** ipfs:// URI */
        image: string;
      };

      voucher: {
        account: string;

        /** ipfs:// URI */
        tokenURI: string;
      };

      signature: {
        /**
         * JSON representation
         */
        message: string;
        messageHash: string;

        v: string;
        r: string;
        s: string;

        signature: string;
      };
    }
  | undefined;

export const threeIdGenPfP = async (
  provider: ethers.providers.Web3Provider
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
        name: network.name,
        chainId: network.chainId,
      },
    };

    res = await sdkWeb?.node_v1?.oort.callRpc(sdk, {
      method: ["3id", "gen-p-f-p"],
      params: req,
    });

    if (!res || res?.error || res?.body.error) {
      throw new Error();
    }
  } catch (e) {
    console.warn("Failed to generate PFP");
    res = null;
  }

  return res;
};

export const threeIdMint = async (genPfPres: GenPfPRes): Promise<boolean> => {
  let success: boolean = false;

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

  return success;
};

/// PROFILE
export const threeIdGetProfile = async () => retrieve("3id.profile", "profile");
export const threeIdSetProfile = async (updatedProfile: Profile) =>
  store("3id.profile", "profile", updatedProfile);

// STORAGE

const store = async (ns: string, path: string, data: any) => {
  let storedObject: any;

  try {
    const res = await sdkWeb?.node_v1?.oort.callRpc(sdk, {
      method: ["kb", "set-data"],
      params: [ns, path, JSON.stringify(data)],
    });

    if (!res || res?.error || res?.body.error) {
      throw new Error();
    }

    storedObject = JSON.parse(res.body.result.value);
  } catch (e) {
    console.warn("Failed to store data");
  }

  return storedObject;
};

const retrieve = async (ns: string, path: string): Promise<any> => {
  let storedObject: any;

  try {
    const res = await sdkWeb?.node_v1?.oort.callRpc(sdk, {
      method: ["kb", "get-data"],
      params: [ns, path],
    });

    if (!res || res?.error || res?.body.error) {
      throw new Error();
    }

    storedObject = JSON.parse(res.body.result.value);
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
  naming: boolean;
};

export const tickFunnelStep = async (step: keyof FunnelState) => {
  let funnelState: FunnelState = {
    mint: false,
    invite: false,
    naming: false,
  };

  const storedFunnelState = await retrieve("3id.profile", "funnel-state");
  if (storedFunnelState) {
    funnelState = storedFunnelState;
  }

  funnelState[step] = true;

  await store("3id.profile", "funnel-state", funnelState);
};

export const getFunnelState = async (): Promise<FunnelState> => {
  const storedFunnelState = await retrieve("3id.profile", "funnel-state");
  let funnelRes: FunnelState = {
    invite: false,
    mint: false,
    naming: false,
  };

  if (storedFunnelState) {
    funnelRes = storedFunnelState;
  }

  return funnelRes;
};
