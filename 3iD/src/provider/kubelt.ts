// @ts-ignore
import sdkWeb from "../../../packages/sdk-web/lib/com.kubelt.sdk.js";

import { ethers } from "ethers";
import { hexlify } from "ethers/lib/utils";

import Constants from "expo-constants";

let sdk: any = null;

export const getSDK = async (): Promise<any> => {
  if (!sdk) {
    sdk = await sdkWeb.node_v1.init({
      "oort/scheme": Constants.manifest?.extra?.oortSchema,
      "oort/host": Constants.manifest?.extra?.oortHost,
      "oort/port": Constants.manifest?.extra?.oortPort,
    });
  }

  return sdk;
};

export const kbGetClaims = async (): Promise<string[]> => {
  let claims: string[] = [];

  if (!sdk) {
    sdk = await getSDK();
  }

  try {
    claims = (await sdkWeb.node_v1.oort.claims(sdk)) || [];
  } catch (e) {
    console.warn("Failed to get claims, falling back to empty array");
  }

  return claims;
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

  try {
    if (!sdk) {
      sdk = await getSDK();
    }

    const restoredSdk = await sdkWeb.node_v1.restore(sdk);
    if ('error' === restoredSdk.type) {
      console.error('There was a problem restoring Kubelt SDK state');
      console.error(restoredSdk.error);
    }

    // We use isLoggedIn as a way to check if SDK
    // was persisted, as there is no other way;
    const isLoggedIn = await sdkWeb.node_v1.oort.isLoggedIn(
      restoredSdk,
      address
    );

    // If TRUE => SDK was persisted and is authenticated
    if (isLoggedIn) {
      sdk = restoredSdk;
    } // IF FALSE => Either not authenticated or not persisted

    let isAuth = await isAuthenticated(address);
    if (force || !isAuth) {
      let network = null;
      try {
        network = await provider.getNetwork();

        // If network changes under us
        // we get an exception
        // which we can use
        // to force refresh
      } catch (e) {
        window.location.reload();
      }

      console.log({
        chainId: network?.chainId,
      });

      sdk = await sdkWeb.node_v1.oort.setWallet(sdk, {
        address,
        signFn,
      });

      sdk = await sdkWeb.node_v1.oort.authenticate(sdk, {
        "3id.profile": ["read", "write"],
      });

      isAuth = await isAuthenticated(address);
      if (isAuth) {
        await sdkWeb.node_v1.store(sdk);
      }
    }
  } catch (e) {
    console.error(e);
    console.warn("There was a problem authenticating to the Kubelt SDK");
  }
};

export const isAuthenticated = async (address: string | null | undefined) => {
  if (!sdk) {
    sdk = await getSDK();
  }

  let isAuth = false;
  if (await sdkWeb.node_v1.oort.isLoggedIn(sdk, address)) {
    isAuth = true;
  }

  return isAuth;
};

export const purge = () => {
  sdk = null;

  localStorage.clear();
  sessionStorage.clear();
};
