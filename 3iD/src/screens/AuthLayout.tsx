import React, { useEffect } from "react";

import { Image, ScrollView, View, Text, Pressable } from "react-native";
import NavMenu from "../components/NavMenu";
import useAccount from "../hooks/account";
import useSDKAuth from "../hooks/sdkAuth";
import { authenticate, isAuthenticated, kbGetClaims } from "../provider/kubelt";
import { connect, forceAccounts } from "../provider/web3";

export default function Layout({
  children,
  navigation,
}: {
  children: any;
  navigation: any;
}) {
  const account = useAccount();
  const sdkAuth = useSDKAuth();

  const claimsRedirect = async (claim: string) => {
    claim = claim.trim().toLowerCase();

    const claims = await kbGetClaims();
    if (!claims.includes(claim)) {
      navigation.navigate("Landing");
    }
  };

  useEffect(() => {
    if (account === null) {
      navigation.navigate("Landing");
    }

    const asyncFn = async () => {
      const claim = "3id.enter";

      if (await isAuthenticated(account)) {
        return claimsRedirect(claim);
      } else {
        const provider = await connect(false);

        await authenticate(provider);

        const signer = provider.getSigner();
        const address = await signer.getAddress();

        if (await isAuthenticated(address)) {
          return claimsRedirect(claim);
        } else {
          navigation.navigate("Landing");
        }
      }
    };

    if (account) {
      asyncFn();
    }
  }, [account, sdkAuth]);

  useEffect(() => {
    const asyncFn = async () => {
      await forceAccounts();
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
          position: "absolute",
          flex: 1,
          height: "33%",
          backgroundColor: "#192030",
          left: 0,
          right: 0,
          zIndex: -1,
        }}
      ></View>

      <View
        style={{
          flex: 1,
          marginHorizontal: "5em",
          marginVertical: "3em",
        }}
      >
        <NavMenu />

        <View
          style={{
            flex: 1,
            flexDirection: "row",
            marginBottom: "3em",
            shadowRadius: 5,
            shadowOpacity: 0.1,
          }}
        >
          <View
            style={{
              flex: 2,
              backgroundColor: "#F9FAFB",
            }}
          ></View>

          <ScrollView
            style={{
              flex: 8,
              backgroundColor: "#FFFFFF",
              paddingVertical: "2em",
              paddingHorizontal: "3em",
            }}
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}
