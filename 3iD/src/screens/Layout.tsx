import React from "react";

import { Image, SafeAreaView, Text, View } from "react-native";

export default function Layout({ children }: { children: any }) {
  return (
    <SafeAreaView
      style={{
        minHeight: "100%",
        backgroundColor: "#F9FAFB",
      }}
    >
      <View
        style={{
          paddingVertical: "1em",
          paddingHorizontal: "1em",
        }}
      >
        <Image
          style={{
            width: 36.56,
            height: 41.05,
          }}
          source={require("../assets/three-id-logo.svg")}
        />
      </View>

      <View
        style={{
          flex: 1,
          paddingHorizontal: "1em",
          paddingVertical: "3em",
          marginTop: -40,
        }}
      >
        {children}
      </View>

      <View
        style={{
          padding: "1em",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 16,
            fontWeight: "400",
            lineHeight: 24,
            color: "#9CA3AF",
            textAlign: "center",
          }}
        >
          3ID is non-custodial and secure. We will never request access to your
          assets.
        </Text>
      </View>
    </SafeAreaView>
  );
}
