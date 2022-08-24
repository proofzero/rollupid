import { BehaviorSubject } from "rxjs";
import { ethers } from "ethers";
import { hexlify } from "ethers/lib/utils";
import { store } from "../state/store";
import { clearSlice, setAddress } from "../state/slices/profile";

const accountSubj = new BehaviorSubject<undefined | null | string>(undefined);

let web3Provider: null | ethers.providers.Web3Provider = null;

const eth = (window as any).ethereum;

export const isMetamask = () => eth?.isMetaMask === true;

export const getAccount = (): undefined | null | string => {
  return accountSubj.getValue();
};

export const getAccountObs = () => {
  return accountSubj.asObservable();
};

const handleAccountsChanged = async (accounts: string[]) => {
  if (accounts.length > 0) {
    try {
      const provider = await connect();
      const account = await provider.getSigner().getAddress();

      // We want to make sure that the used account
      // is the same as the signer account;
      // Getting address via signer will generate
      // a properly cased address string.
      if (account.toLowerCase() === accounts[0].toLowerCase()) {
        // We don't want to force unnecessary refreshes
        // to subscribers so we don't update
        // unless the value changed
        if (account !== accountSubj.getValue()) {
          accountSubj.next(account);

          // Account could still be NULL
          // so we want to clear profile state
          // if that's the case
          if (account) {
            store.dispatch(setAddress(account));
          } else {
            store.dispatch(clearSlice());
          }
        }
      }
    } catch (e) {
      console.error(`WEB3: ${e}`);
    }
  } else {
    console.warn(`WEB3: No accounts detected`);

    clearAccount();
  }
};

eth?.on("accountsChanged", handleAccountsChanged);

/**
 * General purpose method that can be used throughout to get access to the current web3 provider.
 * If it doesn't exist, the provider will be created and set up.
 *
 * @param resync If true, will force a prompt for accounts even if they are already connected
 * @returns available web3 provider
 */
export const connect = async (
  resync: boolean = false
): Promise<ethers.providers.Web3Provider> => {
  if (!web3Provider) {
    web3Provider = new ethers.providers.Web3Provider(eth);
  }

  if (resync) {
    // This just fakes account disconnection
    // if users would come back they would find their
    // account still connected
    await web3Provider?.send("wallet_requestPermissions", [
      { eth_accounts: {} },
    ]);

    await forceAccounts();
  }

  return web3Provider;
};

/**
 * This method forces accounts to refresh
 * by calling `eth_accounts` provider RPC
 * can be used to check if user is already
 * connected to the domain
 */
export const forceAccounts = async () => {
  const accounts = await eth?.request({ method: "eth_accounts" });
  if (accounts) {
    handleAccountsChanged(accounts);
  }
};

/**
 * Clear account behavior (null) allowing observers to
 * handle cleared accounts
 *
 * @param purge If true, local and session storages will be cleared
 */
export const clearAccount = () => {
  // We force app wide refresh
  // this has to be handled in views
  // or layouts
  accountSubj.next(null);
  store.dispatch(clearSlice());
};

export const sign = async (message: string) => {
  const signableBuffer = Buffer.from(message);
  const msgHash = hexlify(signableBuffer);

  const signer = web3Provider?.getSigner();
  const address = await signer?.getAddress();

  const signed = await web3Provider?.send("personal_sign", [address, msgHash]);

  return signed;
};
