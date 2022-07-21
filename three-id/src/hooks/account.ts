import { useState, useEffect } from "react";
import { connect, getAccountObs } from "../provider/web3";

const useAccount = () => {
  const [account, setAccount] = useState<undefined | null | string>(undefined);

  useEffect(() => {
    const sub = getAccountObs().subscribe(async (changedAccount) => {
      if (changedAccount !== account) {
        const provider = await connect(false);
        if (provider) {
          const account = await provider.getSigner().getAddress();
          setAccount(account);
        } else {
          throw new Error("Provider and address mismatch");
        }
      }
    });

    connect(false);

    return () => {
      sub.unsubscribe();
    };
  }, []);

  return account;
};

export default useAccount;
