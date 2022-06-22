import React, { useEffect } from "react";

import { Text, View } from "react-native";
import useAccount from "../hooks/account";
import { connect, getAccount } from "../provider/web3";
import Layout from "./Layout";

export default function Landing({ navigation }: { navigation: any }) {
  const account = useAccount();

  useEffect(() => {
    const asyncFn = async () => {
      if (!getAccount()) {
        await connect();
      }
    };

    asyncFn();
  }, []);

  useEffect(() => {
    if (account) {
      navigation.navigate("Auth");
    }
  }, [account]);

  return (
    <Layout>
      <View
        style={{
          justifyContent: "flex-start",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            paddingTop: "1em",
            fontFamily: "Inter_700Bold",
            fontSize: 24,
            fontWeight: "700",
            lineHeight: 28,
            color: "#1F2937",
          }}
        >
          Connect Your Wallet
        </Text>
      </View>
    </Layout>
  );
}
