import React, { useEffect } from "react";

import useAccount from "../../hooks/account";

import { clearAccount, connect, forceAccounts } from "../../provider/web3";
import {
  authenticate,
  isAuthenticated,
  kbGetClaims,
  purge,
} from "../../provider/kubelt";

import Layout from "../Layout";
import { Text, View } from "react-native";

export default function Auth({ navigation }: { navigation: any }) {
  const account = useAccount();

  const claimsRedirect = async (claim: string) => {
    claim = claim.trim().toLowerCase();

    const claims = await kbGetClaims();
    if (claims.includes(claim)) {
      return navigation.navigate("Settings");
    } else {
      return navigation.navigate("Gate");
    }
  };

  useEffect(() => {
    if (account === null) {
      // User maybe disconnected in the process
      return navigation.navigate("Landing");
    }

    const asyncFn = async () => {
      const claim = "3id.enter";

      if (await isAuthenticated(account)) {
        return claimsRedirect(claim);
      } else {
        const provider = await connect();

        await authenticate(provider);

        const signer = provider.getSigner();
        const address = await signer.getAddress();

        if (await isAuthenticated(address)) {
          return claimsRedirect(claim);
        } else {
          throw new Error("Unsuccesful authentication to Kubelt SDK");
        }
      }
    };

    if (account) {
      asyncFn();
    }
  }, [account]);

  useEffect(() => {
    const asyncFn = async () => {
      await forceAccounts();
    };

    if (account === undefined) {
      asyncFn();
    }
  }, []);

  return (
    <Layout>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            paddingBottom: "1em",
            fontFamily: "Inter_700Bold",
            fontSize: 20,
            fontWeight: "700",
            lineHeight: 28,
            color: "#1F2937",
            maxWidth: 758,
          }}
        >
          Connecting with MetaMask... It could take a few seconds for the
          message to appear. If it does not appear try clicking on your wallet.
        </Text>

        <Text
          style={{
            paddingTop: "1em",
            fontFamily: "Inter_400Regular",
            fontSize: 24,
            fontWeight: "400",
            lineHeight: 32,
            color: "#1F2937",
          }}
        >
          Sign the message with your wallet.
        </Text>
      </View>
    </Layout>
  );
}
