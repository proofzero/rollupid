import Web3Modal from "web3modal";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";

import { BehaviorSubject } from "rxjs";
import { ethers } from "ethers";

const web3Modal = new Web3Modal({
  network: "testnet",
  theme: "light",
  cacheProvider: true,
  providerOptions: {
    coinbasewallet: {
      package: CoinbaseWalletSDK,
      options: {
        // TODO: Establish appName
        appName: "Kubelt",
      },
    },
  },
});

const accountSubj = new BehaviorSubject<undefined | null | string>(undefined);

let web3Provider: null | ethers.providers.Web3Provider = null;

const forceAccountsHandle = async () => {
  const accounts = await web3Provider?.send("eth_accounts", []);
  handleAccountsChanged(accounts);
};

const handleAccountsChanged = (accounts: string[]) => {
  if (accounts.length > 0) {
    accountSubj.next(accounts[0]);
  } else {
    accountSubj.next(null);
  }
};

export const connect = async (): Promise<ethers.providers.Web3Provider> => {
  if (!web3Provider) {
    const web3Conn = await web3Modal.connect();
    web3Conn.on("accountsChanged", handleAccountsChanged);

    web3Provider = new ethers.providers.Web3Provider(web3Conn);
  }

  forceAccountsHandle();

  return web3Provider;
};

export const getAccount = (): undefined | null | string => {
  return accountSubj.getValue();
};

export const getAccountObs = () => {
  return accountSubj.asObservable();
};
