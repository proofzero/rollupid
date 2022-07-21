import { useState, useEffect } from "react";
import { getIsAuthObs } from "../provider/kubelt";

const useSDKAuth = () => {
  const [auth, setAuth] = useState<any>();

  useEffect(() => {
    const sub = getIsAuthObs().subscribe(async (isAuth) => {
      if (!auth && isAuth) {
        setAuth(true);
      } else if (auth && !isAuth) {
        setAuth(false);
      }
    });

    return () => {
      sub.unsubscribe();
    };
  }, []);

  return auth;
};

export default useSDKAuth;
