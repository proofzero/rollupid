import { useState, useEffect } from "react";

import { $account } from "../domain/kubeltWallet";

/**
 * Subscribe to the current crypto wallet's account inside
 * React components so that you can reason about
 * the current identity
 */
export const useAccount = () => {
  const [account, setAccount] = useState(null);

  useEffect(() => {
    const accountSub = $account.subscribe((updAccount) =>
      setAccount(updAccount)
    );

    return () => {
      accountSub.unsubscribe();
    };
  }, []);

  return account;
};

export default useAccount;
