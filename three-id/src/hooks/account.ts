import { useState, useEffect } from "react";
import { connect, getAccountObs } from "../provider/web3";

const useAccount = () => {
  const [account, setAccount] = useState<undefined | null | string>(undefined);

  useEffect(() => {
    const sub = getAccountObs().subscribe((changedAccount) => {
      if (changedAccount !== undefined && changedAccount !== account) {
        setAccount(changedAccount);
      }
    });

    const asyncFn = async () => {
      await connect();
    };

    asyncFn();

    return () => {
      sub.unsubscribe();
    };
  }, []);

  return account;
};

export default useAccount;
