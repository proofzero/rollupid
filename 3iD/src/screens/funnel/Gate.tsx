import React, { useEffect } from "react";

import { Pressable, Text, View } from "react-native";
import useAccount from "../../hooks/account";
import Layout from "../Layout";

import Constants from "expo-constants";
import { clearAccount, forceAccounts } from "../../provider/web3";
import { isAuthenticated, kbGetClaims, purge } from "../../provider/kubelt";

import { useAsyncStorage } from "@react-native-async-storage/async-storage";

export default function Gate({ navigation }: { navigation: any }) {
  const account = useAccount();

  const otherWalletRequested = useAsyncStorage("kubelt:other_wallet_request");

  const claimsRedirect = async (claim: string) => {
    claim = claim.trim().toLowerCase();

    const claims = await kbGetClaims();
    if (claims.includes(claim)) {
      return navigation.navigate("Settings");
    }
  };

  const tryDifferentWallet = async () => {
    await otherWalletRequested.setItem("true");

    purge();
    clearAccount();
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
        return navigation.navigate("Auth");
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
        <Pressable
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 49,
            paddingTop: 12,
            paddingBottom: 14,
            backgroundColor: "#192030",
            maxWidth: "100%",
            height: 48,
          }}
          onPress={() => tryDifferentWallet()}
        >
          <Text
            style={{
              fontFamily: "Manrope_700Bold",
              fontSize: 16,
              fontWeight: "700",
              lineHeight: 22,
              color: "white",
            }}
          >
            Try Different Wallet
          </Text>
        </Pressable>

        <Text
          style={{
            paddingTop: 56,
            paddingBottom: 43,
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
            maxWidth: 758,
            textAlign: "center",
          }}
        >
          To get onto the whitelist{" "}
          <a
            target={"_blank"}
            rel={"noopener noopener noreferrer"}
            href={Constants.manifest?.extra?.twitterUrl}
          >
            follow us on Twitter
          </a>
          ,{" "}
          <a
            target={"_blank"}
            rel={"noopener noopener noreferrer"}
            href={Constants.manifest?.extra?.discordUrl}
          >
            join our Discord
          </a>{" "}
          and leave us a message in{" "}
          <a
            target={"_blank"}
            rel={"noopener noopener noreferrer"}
            href={Constants.manifest?.extra?.discordChannelUrl}
          >
            #3iD
          </a>{" "}
          channel
        </Text>
      </View>
    </Layout>
  );
}
