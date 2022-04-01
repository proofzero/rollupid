import { BehaviorSubject, Observable, Subscription } from "rxjs";
import detectEthereumProvider from "@metamask/detect-provider";
import kSdkWeb from "@kubelt/sdk-web";
import { hexlify } from "@ethersproject/bytes";

export interface IKubeltError extends String { }

export interface IKubeltSdkWallet {
  address: string;

  signFn: (signable: string) => Promise<string>;
}

export interface IKubeltSdk extends IKubeltSdkWallet { }

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

    const initSDK = await kSdkWeb?.node_v1?.init();
    sdkSubj.next(initSDK);

    console.log('SDK initialized')
    console.log(initSDK);
    console.log('/SDK initialized')

    const walletInitSDK = await kSdkWeb?.node_v1?.core.setWallet(initSDK, wallet);
    sdkSubj.next(walletInitSDK);

    console.log('Wallet initialized')
    console.log(walletInitSDK);
    console.log('/Wallet initialized')
  }
};

const getEthProvider = async () => {
  const ethProvider = (await detectEthereumProvider({
    mustBeMetaMask: true,
  })) as any;
  if (!ethProvider) {
    throw new Error(
      "MetaMask not found. Connection to Kubelt network impossible."
    );
  }

  return ethProvider;
};

const asyncMain = async () => {
  const ethProvider = await getEthProvider();

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

export const requestKubeltAuth = async (core: string) => {
  const currentAccount = accountSubj.getValue();
  if (!currentAccount) {
    throw new Error("No account available for signing");
  }

  core = currentAccount

  const authedSdk = await kSdkWeb.node_v1.core.authenticate(
    sdkSubj.getValue(),
    core
  );

  console.log(`Async Authenticated vs. Kubelt SDK and Kubelt Core ${core}`);
  console.log(authedSdk);
};
