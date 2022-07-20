import Constants from "expo-constants";
import React, { useEffect } from "react";

import useAccount from "../../hooks/account";

import { connect } from "../../provider/web3";
import {
  authenticate,
  isAuthenticated,
  kbGetClaims,
} from "../../provider/kubelt";

import Layout from "../Layout";
import { Text, View } from "react-native";

export default function Auth({ navigation }: { navigation: any }) {
  const account = useAccount();

  const claimsRedirect = async (claim: string) => {
    claim = claim.trim().toLowerCase();

    if (!account) {
      throw new Error("Account is null");
    }

    const provider = await connect(false);

    const claims = await kbGetClaims(provider);
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
        await claimsRedirect(claim);
      } else {
        const provider = await connect();
        await authenticate(provider);

        const signer = provider.getSigner();
        const address = await signer.getAddress();

        if (await isAuthenticated(address)) {
          await claimsRedirect(claim);
        } else {
          return navigation.navigate("Landing");
        }
      }
    };

    if (account) {
      asyncFn();
    }
  }, [account]);

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
