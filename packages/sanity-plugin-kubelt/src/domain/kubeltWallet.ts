import { BehaviorSubject } from "rxjs";

import IKubeltSdkWallet from "./kubeltSDKWallet";

import getEthProvider from "../utils/ethProvider";
import kSdkWeb from "@kubelt/sdk-web";

import { hexlify } from "@ethersproject/bytes";

/**
 * TODO: Define once API is stable
 */
interface IKubeltSdk {}

const sdkSubj = new BehaviorSubject<IKubeltSdk>(null);
const accountSubj = new BehaviorSubject<string>(null);

const handleAccountsChanged = async (accounts: string[]) => {
  if (accounts.length === 0) {
    accountSubj.next(null);
  } else {
    const account = accounts[0];
    accountSubj.next(account);

    const wallet: IKubeltSdkWallet = {
      address: account,
      signFn: signFn,
    };

    const walletInitSDK = await kSdkWeb?.node_v1?.core.setWallet(
      sdkSubj.getValue(),
      wallet
    );
    sdkSubj.next(walletInitSDK);
  }
};

const asyncMain = async () => {
  const ethProvider = await getEthProvider();

  const initSDK = await kSdkWeb?.node_v1?.init();
  sdkSubj.next(initSDK);

  ethProvider.on("accountsChanged", handleAccountsChanged);

  const accounts = await ethProvider.request({
    method: "eth_requestAccounts",
  });
  handleAccountsChanged(accounts);
};

asyncMain();

export const $sdk = sdkSubj.asObservable();
export const $account = accountSubj.asObservable();

export const requestWalletAuth = async () => {
  const ethProvider = await getEthProvider();
  await ethProvider.request({
    method: "eth_requestAccounts",
  });
};

const signFn = async (signable: string) => {
  const ethProvider = await getEthProvider();
  const currentAccount = accountSubj.getValue();
  if (!currentAccount) {
    throw new Error("No account available for signing");
  }

  const signableBuffer = Buffer.from(signable);
  const msgHash = hexlify(signableBuffer);

  const signed = await ethProvider.request({
    method: "personal_sign",
    params: [msgHash, currentAccount],
  });

  // const recoveredAccount = recoverPersonalSignature({
  //   data: msgHash,
  //   sig: signed
  // })

  return signed;
};

export const requestKubeltAuth = async (core: string = null) => {
  const currentAccount = accountSubj.getValue();
  if (!currentAccount) {
    throw new Error("No account available for signing");
  }

  if (!core) {
    core = currentAccount;
  }

  const authedSdk = await kSdkWeb.node_v1.core.authenticate(
    sdkSubj.getValue(),
    core
  );

  console.log(`Async Authenticated vs. Kubelt SDK and Kubelt Core ${core}`);
  console.log(authedSdk);
};
