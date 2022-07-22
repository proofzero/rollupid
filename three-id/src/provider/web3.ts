import { BehaviorSubject } from "rxjs";
import { ethers } from "ethers";

const accountSubj = new BehaviorSubject<undefined | null | string>(undefined);

let web3Provider: null | ethers.providers.Web3Provider = null;

const eth = (window as any).ethereum;

export const isMetamask = () => eth?.isMetaMask === true;

/**
 * Clear account behavior (null) allowing observers to
 * handle cleared accounts
 *
 * @param purge If true, local and session storages will be cleared
 */
export const clearAccount = async (purge: boolean = false) => {
  // We force app wide refresh
  // this has to be handled in views
  // or layouts
  console.debug(
    `WEB3:CLEAR:Clearing account subject ${accountSubj.getValue()}`
  );
  accountSubj.next(null);

  // This can remove the SDK from ls
  // so authentication is forced
  // and signing is requested again
  if (purge) {
    console.debug(`WEB3:CLEAR:Purge detected. Clearing targets.`);
    localStorage.clear();

    // Not needed yet
    // sessionStorage.clear();
  }
};

const handleAccountsChanged = async (accounts: string[]) => {
  console.debug(`WEB3: Handling accounts changed ${accounts}`);

  if (accounts.length > 0) {
    console.debug(`WEB3: Detected accounts`);

    try {
      const currentAccount = accountSubj.getValue();

      const provider = await connect(false);
      const account = await provider.getSigner().getAddress();
      console.debug(`WEB3: Identified signer account ${account}`);

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
          console.debug(
            `WEB3: Succesfully updated account observable from ${currentAccount} to ${account}`
          );
        }
      }
    } catch (e) {
      console.error(`WEB3: ${e}`);
    }
  } else {
    console.debug(`WEB3: No accounts detected`);

    await clearAccount();
  }
};

eth?.on("accountsChanged", handleAccountsChanged);

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
 * General purpose method that can be used throughout to get access to the current web3 provider.
 * If it doesn't exist, the provider will be created and set up.
 *
 * @param resync If true, will force a prompt for accounts even if they are already connected
 * @returns available web3 provider
 */
export const connect = async (
  resync: boolean = true
): Promise<ethers.providers.Web3Provider> => {
  if (!web3Provider) {
    web3Provider = new ethers.providers.Web3Provider(eth);
  }

  if (resync && !accountSubj.getValue()) {
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

export const getAccount = (): undefined | null | string => {
  return accountSubj.getValue();
};

export const getAccountObs = () => {
  return accountSubj.asObservable();
};
