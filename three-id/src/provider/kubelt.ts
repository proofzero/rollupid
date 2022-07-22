// @ts-ignore
import sdkWeb from "../../../packages/sdk-web/lib/com.kubelt.sdk.js";

import { ethers } from "ethers";
import { hexlify } from "ethers/lib/utils";

import { BehaviorSubject } from "rxjs";
import Constants from "expo-constants";
import { Profile } from "../types/Profile";

let sdk: any = null;

const isAuthSubj = new BehaviorSubject(false);

export const purge = () => {
  sdk = null;
  localStorage.clear();
  isAuthSubj.next(false);
};

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

      sdk = await sdkWeb?.node_v1?.oort.authenticate(sdk, address);

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

// Exposing this method until SDK isAuth gets sorted
export const isAuthenticated = async (address: string | null | undefined) => {
  if (!sdk || !address) {
    return false;
  }

  return sdkWeb?.node_v1?.oort.isLoggedIn(sdk, address);
};

export const kbGetClaims = async (): Promise<string[]> => {
  let claims: string[] = [];

  try {
    claims = await sdkWeb?.node_v1?.oort.claims(sdk);
  } catch (e) {
    console.warn("Failed to get claims, falling back to empty array");
  }

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
          if (x?.body?.error) {
            reject(x.body.error);
          } else {
            resolve(x?.body?.result);
          }
        });
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
        .then((x: any) => {
          if (x?.body?.error) {
            reject(x.body.error);
          } else {
            resolve(x?.body?.result);
          }
        });
    });
  });
  return profile;
};

export const getIsAuthObs = () => isAuthSubj.asObservable();
