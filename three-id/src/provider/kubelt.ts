// @ts-ignore
import sdkWeb from "../../../packages/sdk-web/lib/com.kubelt.sdk.js";

import { ethers } from "ethers";
import { hexlify } from "ethers/lib/utils";

import { BehaviorSubject } from "rxjs";
import Constants from "expo-constants";
import { Profile } from "../types/Profile";

let sdk: any = null;

const isAuthSubj = new BehaviorSubject(false);

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

  try {
    if (!sdk) {
      sdk = await sdkWeb?.node_v1?.init({
        "oort/scheme": Constants.manifest?.extra?.oortSchema,
        "oort/host": Constants.manifest?.extra?.oortHost,
        "oort/port": Constants.manifest?.extra?.oortPort,
      });
    }

    sdk = await sdkWeb?.node_v1?.oort.setWallet(sdk, {
      address,
      signFn,
    });
    isAuthSubj.next(false);

    const isAuth = await isAuthenticated(address);
    if (force || !isAuth) {
      sdk = await sdkWeb?.node_v1?.oort.authenticate(sdk, address);

      await sdkWeb.node_v1.store(sdk);

      sessionStorage.setItem(`auth_${address}`, "true");

      isAuthSubj.next(true);
    }
  } catch (e) {
    isAuthSubj.next(false);

    throw e;
  }
};

// Exposing this method until SDK isAuth gets sorted
export const isAuthenticated = async (address: string | null | undefined) => {
  if (address == null) {
    return false;
  }

  const isAuth = isAuthSubj.getValue();
  const isAuthStored = sessionStorage.getItem(`auth_${address}`) === "true";
  const isAuthSDK = await sdkWeb?.node_v1?.oort.isLoggedIn();

  return isAuth || isAuthStored || isAuthSDK;
};

export const kbGetClaims = async () => {
  const claims: string[] = await sdkWeb?.node_v1?.oort.claims(sdk);
  console.log("kbGetClaims", claims);
  return claims;
};
export const kbGetProfile = async (core: string) => {
  const profile: Profile = await new Promise((resolve, reject) => {
    sdkWeb?.node_v1?.oort.rpcApi(sdk, core).then((api: any) => {
      // TODO: async / await? 🤔
      sdkWeb?.node_v1?.oort
        .callRpcClient(sdk, api, {
          method: ["kb", "get", "profile"],
          params: [],
        })
        .then((x: any) => {
          resolve(x?.body?.result);
        });
      // TODO check if not 200 status response
    });
  });

  return profile;
};

export const kbSetProfile = async (core: string, updatedProfile: Profile) => {
  const profile = await new Promise((resolve, reject) => {
    sdkWeb?.node_v1?.oort.rpcApi(sdk, core).then((api: any) => {
      sdkWeb?.node_v1?.oort
        .callRpcClient(sdk, api, {
          method: ["kb", "set", "profile"],
          params: { profile: updatedProfile },
        })
        .then((x: any) => resolve(x?.body?.result));
      // TODO check if not 200 status response
    });
  });
  return profile;
};
