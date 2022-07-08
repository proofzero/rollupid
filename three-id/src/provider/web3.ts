import { BehaviorSubject } from "rxjs";
import { ethers } from "ethers";

const accountSubj = new BehaviorSubject<undefined | null | string>(undefined);

let web3Provider: null | ethers.providers.Web3Provider = null;

const eth = (window as any).ethereum;

export const isMetamask = () => eth?.isMetaMask === true;

export const clearAccount = async () => {
  accountSubj.next(null);
  sessionStorage.clear();
};

const handleAccountsChanged = (accounts: string[]) => {
  const currentAccount = accountSubj.getValue();
  if (accounts.length > 0) {
    if (accounts[0] !== currentAccount) {
      accountSubj.next(accounts[0]);
    }
  } else {
    accountSubj.next(null);
  }
};

eth?.on("accountsChanged", handleAccountsChanged);

export const forceAccounts = async () => {
  const accounts = (await eth?.request({ method: "eth_accounts" })) || [];
  handleAccountsChanged(accounts);
};

export const connect = async (): Promise<ethers.providers.Web3Provider> => {
  if (!web3Provider) {
    web3Provider = new ethers.providers.Web3Provider(eth);
  }

  if (!accountSubj.getValue()) {
    await web3Provider?.send("wallet_requestPermissions", [
      { eth_accounts: {} },
    ]);
  }
  await forceAccounts();

  return web3Provider;
};

export const getAccount = (): undefined | null | string => {
  return accountSubj.getValue();
};

export const getAccountObs = () => {
  return accountSubj.asObservable();
};
