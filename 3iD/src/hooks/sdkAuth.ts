import { useState, useEffect } from "react";
import { getIsAuthObs } from "../provider/kubelt";

const useSDKAuth = () => {
  const [auth, setAuth] = useState<any>();

  useEffect(() => {
    const sub = getIsAuthObs().subscribe((isAuth) => {
      if (isAuth !== auth) {
        setAuth(isAuth);
      }
    });

    return () => {
      sub.unsubscribe();
    };
  }, []);

  return auth;
};

export default useSDKAuth;
