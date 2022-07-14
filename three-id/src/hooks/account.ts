import { useState, useEffect } from "react";
import { connect, getAccountObs } from "../provider/web3";

const useAccount = () => {
  const [account, setAccount] = useState<undefined | null | string>(undefined);

  useEffect(() => {
    const sub = getAccountObs().subscribe((changedAccount) => {
      if (changedAccount !== account) {
        setAccount(changedAccount);
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
