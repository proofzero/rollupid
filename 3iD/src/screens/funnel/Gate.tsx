import React, { useEffect } from "react";

import { Pressable, Text, View, Image } from "react-native";
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
      navigation.navigate("Settings");
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
      navigation.navigate("Landing");
    }

    const asyncFn = async () => {
      const claim = "3id.enter";

      if (await isAuthenticated(account)) {
        return claimsRedirect(claim);
      } else {
        navigation.navigate("Auth");
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
        <Image
          style={{
            width: 184.82,
            height: 159.91,
            marginBottom: 74.09,
          }}
          source={require("../../assets/sad.png")}
        />

        <Text
          style={{
            paddingHorizontal: 20,
            paddingVertical: 14,
            fontFamily: "Inter_700Bold",
            fontSize: 24,
            fontWeight: "700",
            lineHeight: 32,
            color: "#1F2937",
            marginBottom: 22,
          }}
        >
          Your wallet does not hold an invite token.
        </Text>

        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 24,
            fontWeight: "400",
            lineHeight: 32,
            color: "#1F2937",
            maxWidth: 758,
            textAlign: "center",
            marginBottom: 43,
          }}
        >
          If you want to get an early access please join our Discord.
        </Text>

        <View
          style={{
            flexDirection: "row",
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
              paddingHorizontal: 20,
              paddingVertical: 14,
              backgroundColor: "#E5E7EB",
              marginRight: 20,
            }}
            onPress={() => tryDifferentWallet()}
          >
            <Text
              testID="try-different-wallet"
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 16,
                fontWeight: "500",
                lineHeight: 24,
                color: "#6B7280",
              }}
            >
              Try Different Wallet
            </Text>
          </Pressable>

          <Pressable
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 20,
              paddingVertical: 14,
              backgroundColor: "#192030",
              marginRight: 20,
            }}
          >
            <Text
              testID="gate-join-our-discord"
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 16,
                fontWeight: "500",
                lineHeight: 24,
              }}
            >
              <a
                target={"_blank"}
                rel={"noopener noopener noreferrer"}
                href={Constants.manifest?.extra?.discordUrl}
                style={{ color: "white", textDecoration: "none" }}
              >
                Join Our Discord
              </a>
            </Text>
          </Pressable>
        </View>
      </View>
    </Layout>
  );
}
