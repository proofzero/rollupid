import Constants from "expo-constants";
import React, { useEffect } from "react";

import { Text, View } from "react-native";
import useAccount from "../../hooks/account";
import { authenticate, isAuthenticated } from "../../provider/kubelt";

import { connect } from "../../provider/web3";

import Layout from "../Layout";

export default function Auth({ navigation }: { navigation: any }) {
  const account = useAccount();

  useEffect(() => {
    const asyncFn = async () => {
      if (await isAuthenticated(account)) {
        navigation.navigate("Gate");
      } else {
        const provider = await connect();
        await authenticate(provider);

        const signer = provider.getSigner();
        const address = await signer.getAddress();

        if (await isAuthenticated(address)) {
          navigation.navigate("Gate");
        } else {
          navigation.navigate("Landing");
        }
      }
    };

    asyncFn();
  }, []);

  useEffect(() => {
    if (account === null) {
      // User maybe disconnected in the process
      navigation.navigate("Landing");
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
