import React, { useEffect } from "react";

import { Image, ScrollView, View, Text, Pressable } from "react-native";
import useAccount from "../hooks/account";
import useSDKAuth from "../hooks/sdkAuth";
import { authenticate, isAuthenticated, kbGetClaims } from "../provider/kubelt";
import { connect, forceAccounts } from "../provider/web3";

export default function AppLayout({
  children,
  navigation,
}: {
  children: any;
  navigation: any;
}) {
  const account = useAccount();

  useEffect(() => {
    const asyncFn = async () => {
      await forceAccounts();

      const provider = await connect();
      await authenticate(provider);
    };

    asyncFn();
  }, []);

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#192030",
          paddingHorizontal: "5em",
          paddingVertical: "2em",
        }}
      >
        <Image
          style={{
            width: 36.56,
            height: 41.05,
          }}
          source={require("../assets/three-id-logo-white.svg")}
        />

        <View>
          <Pressable
            style={{
              paddingHorizontal: 13.5,
              paddingVertical: 14,
              backgroundColor: "#FFFFFF",
              maxWidth: "100%",
              height: 48,
            }}
          >
            <Text
              testID="wallet-address"
              style={{
                paddingHorizontal: 37.5,
                fontFamily: "Manrope_700Bold",
                fontSize: 14,
                fontWeight: "700",
                lineHeight: 16,
              }}
            >{`${account?.substring(0, 4)}...${account?.substring(
              account.length - 4
            )}`}</Text>
          </Pressable>
        </View>
      </View>

      {children}
    </View>
  );
}
