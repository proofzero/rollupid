import React, { useEffect } from "react";

import { Text, TextInput, View, Button, Image, Pressable } from "react-native";
import Layout from "../Layout";

import { startView } from "../../analytics/datadog";

export default function Mint() {
  useEffect(() => {
    startView("mint");
  }, []);

  return (
    <Layout>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          backgroundColor: "#FFFFFF",
          shadowRadius: 5,
          shadowColor: "rgb(0, 0, 0)",
          shadowOpacity: 0.1,
        }}
      >
        <View
          style={{
            backgroundColor: "#1F2937",
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "4em",
          }}
        >
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 40,
              fontWeight: "600",
              lineHeight: 36,
              color: "#FFFFFF",
              textAlign: "center",
              marginBottom: "1em",
            }}
          >
            Congratulations!
          </Text>

          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 14,
              fontWeight: "400",
              lineHeight: 28,
              color: "#FFFFFF",
              textAlign: "center",
              maxWidth: 406,
              marginBottom: "3em",
            }}
          >
            We just mathematically generated this mesh gradient NFT and
            air-dropped it to your wallet.
          </Text>

          <View>
            <Image
              style={{
                width: 174,
                height: 174,
              }}
              source={require("../../assets/foo.svg")}
            />
          </View>
        </View>

        <View
          style={{
            flex: 1,
            padding: "2em",
            display: "flex",
          }}
        >
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 40,
              fontWeight: "600",
              lineHeight: 36,
              color: "#111827",
              marginBottom: 17,
            }}
          >
            Welcome Anon
          </Text>

          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 14,
              fontWeight: "400",
              lineHeight: 28,
              color: "#111827",
              marginBottom: 43,
            }}
          >
            To setup your decentralized identity, please pick a username and
            claim the 3ID card NFT -{" "}
            <Text
              style={{
                fontWeight: "bold",
              }}
            >
              Its free
            </Text>
            . You only pay the transaction fee.
          </Text>

          <Text
            style={{
              fontFamily: "Inter_500Medium",
              fontSize: 14,
              fontWeight: "500",
              lineHeight: 20,
              color: "#374151",
            }}
          >
            Username
          </Text>

          <TextInput
            style={{
              borderWidth: 1,
              borderColor: "#D1D5DB",
              paddingVertical: 9,
              paddingHorizontal: 13,
              color: "gray/300",
              marginBottom: 13,
            }}
            placeholder="NFT_Ape_69"
          />

          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 12,
              fontWeight: "400",
              lineHeight: 12,
              color: "#D1D5DB",
            }}
          >
            You can change it later in the Settings
          </Text>

          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 12,
              fontWeight: "400",
              lineHeight: 28,
              color: "#9CA3AF",
              textAlign: "right",
              textDecorationLine: "underline",
            }}
          >
            Learn more about the NFT Card
          </Text>

          <View
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
            }}
          ></View>

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
              Mint your 3ID Card NFT
            </Text>
          </Pressable>
        </View>
      </View>
    </Layout>
  );
}
