// @ts-ignore
import sdkWeb from "../../../packages/sdk-web/lib/com.kubelt.sdk.js";

import { ethers } from "ethers";
import { hexlify } from "ethers/lib/utils";

import { BehaviorSubject } from "rxjs";

import Constants from "expo-constants";

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

export const authenticate = async (provider: ethers.providers.Web3Provider) => {
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

    const isAuth = await sdkWeb?.node_v1?.oort.isLoggedIn();
    if (!isAuth) {
      sdk = await sdkWeb?.node_v1?.oort.authenticate(sdk, address);

      // todo: use oort.store to store the SDK

      isAuthSubj.next(true);
    }
  } catch (e) {
    isAuthSubj.next(false);

    throw e;
  }
};

// Exposing this method until SDK isAuth gets sorted
export const isAuthenticated = () => isAuthSubj.getValue();

export const isWhitelisted = async (
  provider: ethers.providers.Web3Provider
) => {
  if (!sdk) {
    return false;
  }

  if (Constants.manifest?.extra?.autoGate === true) {
    return false
  }

  const signer = provider.getSigner();
  const address = await signer.getAddress();

  /**
   * We expect non whitelisted cores
   * to respond with Unauthorized
   * thus a valid response counts
   * as whitelisting
   */
  let receivedPong = false;
  const api = await sdkWeb?.node_v1?.oort.rpcApi(sdk, address);
  const ping = await sdkWeb?.node_v1?.oort.callRpcClient(sdk, api, { 'method': ['kb', 'ping'], 'params': [] });
  if (ping) {
    receivedPong = true;

    // Temporary workaround for 401 results
    if (ping?.body?.result?.ok === false) {
      receivedPong = false
      console.info("core is not whitelisted");
    }
  }

  return receivedPong;
};
