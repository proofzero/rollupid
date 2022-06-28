import React, { useEffect } from "react";

import { Text, View } from "react-native";
import useAccount from "../hooks/account";
import Layout from "./Layout";

export default function Gate({ navigation }: { navigation: any }) {
  const account = useAccount();

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
            fontSize: 24,
            fontWeight: "700",
            lineHeight: 32,
            color: "#1F2937",
          }}
        >
          Your wallet address is not whitelisted for Early Access.
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
          To get onto the whitelist follow us on Twitter, join our Discord and
          leave us a message in #3ID-Whitelist channel
        </Text>
      </View>
    </Layout>
  );
}
