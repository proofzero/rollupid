import React from "react";

import { Image, Text, View } from "react-native";

export default function Layout({ children }: { children: any }) {
  return (
    <View
      style={{
        height: 100,
        flex: 1,
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
          }}
        >
          3ID is non-custodial and secure. We will never request access to your
          assets.
        </Text>
      </View>
    </View>
  );
}
