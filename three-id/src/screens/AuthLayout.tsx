import React, { useEffect } from "react";

import { Image, ScrollView, View, Text, Pressable } from "react-native";
import { console_log } from "../../../packages/sdk-web/lib/taoensso.encore";
import useAccount from "../hooks/account";
import useSDKAuth from "../hooks/sdkAuth";
import { authenticate, isAuthenticated, kbGetClaims } from "../provider/kubelt";
import { connect } from "../provider/web3";

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
    console_log(claims)
    if (!claims.includes(claim)) {
      return navigation.navigate("Landing");
    }
  };

  useEffect(() => {
    if (account === null) {
      return navigation.navigate("Landing");
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
          return navigation.navigate("Landing");
        }
      }
    };

    if (account) {
      asyncFn();
    }
  }, [account, sdkAuth]);

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
        <View
          style={{
            marginBottom: "3em",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
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
