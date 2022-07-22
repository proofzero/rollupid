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

      const restoredSdk = await sdkWeb?.node_v1?.restore(sdk);
      const isLoggedIn = await sdkWeb?.node_v1?.oort.isLoggedIn(
        restoredSdk,
        address
      );
      if (isLoggedIn) {
        sdk = restoredSdk;

        if (isLoggedIn !== isAuthSubj.getValue()) {
          isAuthSubj.next(isLoggedIn);
        }
      }
    }

    if (force || !(await isAuthenticated(address))) {
      if (isAuthSubj.getValue()) {
        isAuthSubj.next(false);
      }

      sdk = await sdkWeb?.node_v1?.oort.setWallet(sdk, {
        address,
        signFn,
      });

      sdk = await sdkWeb?.node_v1?.oort.authenticate(sdk, address);

      const isLoggedIn = await isAuthenticated(address);
      if (isLoggedIn) {
        await sdkWeb.node_v1.store(sdk);
      }

      if (isLoggedIn !== isAuthSubj.getValue()) {
        isAuthSubj.next(true);
      }
    }
  } catch (e) {
    isAuthSubj.next(false);

    throw e;
  }
};

// Exposing this method until SDK isAuth gets sorted
export const isAuthenticated = async (address: string | null | undefined) => {
  if (!sdk || !address) {
    return false;
  }

  const isAuth = isAuthSubj.getValue();
  const isAuthSDK = await sdkWeb?.node_v1?.oort.isLoggedIn(sdk, address);

  return isAuth || isAuthSDK;
};

export const kbGetClaims = async (): Promise<string[]> => {
  let claims: string[] = ["3iD.enter"];

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
