// @ts-ignore
import sdkWeb from "@kubelt/sdk-web";

import { ethers } from "ethers";
import { hexlify } from "ethers/lib/utils";

import { BehaviorSubject } from "rxjs";

let sdk: any = null;
let sdkStored: any = null;

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
      sdk = await sdkWeb?.node_v1?.init();
    }

    sdk = await sdkWeb?.node_v1?.oort.setWallet(sdk, {
      address,
      signFn,
    });
    isAuthSubj.next(false);

    const isAuth = await sdkWeb?.node_v1?.oort.isLoggedIn();
    if (!isAuth) {
      sdk = await sdkWeb?.node_v1?.oort.authenticate(sdk, address);
      sdkStored = await sdkWeb?.node_v1?.store(sdk);
      isAuthSubj.next(true);
    }
  } catch (e) {
    isAuthSubj.next(false);

    throw e;
  }
};

// Exposing this method until SDK isAuth gets
// sorted after which we can query
// wherever the hook is used
export const isAuthenticated = () => isAuthSubj.getValue();
