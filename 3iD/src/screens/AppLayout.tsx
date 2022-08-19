import React, { useEffect } from "react";

import { Image, View, Text, Pressable, SafeAreaView } from "react-native";
import NavMenu from "../components/NavMenu";
import useAccount from "../hooks/account";
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
        await claimsRedirect(claim);
      } else {
        const provider = await connect(false);

        await authenticate(provider);

        const signer = provider.getSigner();
        const address = await signer.getAddress();

        if (await isAuthenticated(address)) {
          await claimsRedirect(claim);
        } else {
          navigation.navigate("Landing");
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

    asyncFn();
  }, []);

  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}
    >
      <NavMenu />

      <View
        style={{
          backgroundColor: "#FFFFFF",
        }}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}
