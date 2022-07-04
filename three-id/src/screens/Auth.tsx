import Constants from "expo-constants";
import React, { useEffect } from "react";

import { Text, View } from "react-native";
import useAccount from "../hooks/account";
import {
  authenticate,
  isAuthenticated,
} from "../provider/kubelt";

import { connect } from "../provider/web3";

import Layout from "./Layout";

import { startView } from "../analytics/datadog";

export default function Auth({ navigation }: { navigation: any }) {
  const account = useAccount();

  useEffect(() => {
    const asyncFn = async () => {
      if (isAuthenticated()) {
        navigation.navigate("Gate");
      } else {
        const provider = await connect();
        await authenticate(provider);

        if (isAuthenticated()) {
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

  useEffect(() => {
    startView("auth");
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
          }}
        >
          Connecting with MetaMask...
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
