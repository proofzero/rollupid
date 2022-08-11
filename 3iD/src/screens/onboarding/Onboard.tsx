import Constants from "expo-constants";
import React from "react";

import { View, Text, Image, Pressable } from "react-native";

import Layout from "../AuthLayout";

export default function Onboard({ navigation }: { navigation: any }) {
  return (
    <Layout navigation={navigation}>
      <View
        style={{
          flex: 1,
          backgroundColor: "white",
        }}
      >
        {/* Mint */}
        <View
          style={{
            padding: 20,
            flexDirection: "row",

            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#F9FAFB",

            marginBottom: 13,
          }}
        >
          <View
            style={{
              flexDirection: "row",
            }}
          >
            <Image
              style={{
                width: 40,
                height: 40,
                marginRight: 12,
              }}
              source={{
                uri: "https://picsum.photos/40",
              }}
            />

            <View>
              <Text
                style={{
                  paddingBottom: 4,
                  fontFamily: "Inter_500Medium",
                  fontSize: 14,
                  fontWeight: "500",
                  lineHeight: 20,
                  color: "#111827",
                }}
              >
                Free mint!
              </Text>

              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 14,
                  fontWeight: "400",
                  lineHeight: 20,
                  color: "#6B7280",
                }}
              >
                You can still mint your 1/1 gradient for free
              </Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
            }}
          >
            <Pressable
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                paddingHorizontal: 22.5,
                paddingVertical: 9,
                marginRight: 12,
                backgroundColor: "#F3F4F6",
              }}
            >
              <Text
                testID="onboard-dont-show-again"
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 14,
                  fontWeight: "500",
                  lineHeight: 16,
                  color: "#374151",
                }}
              >
                Don't show again
              </Text>
            </Pressable>

            <Pressable
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                paddingHorizontal: 22.5,
                paddingVertical: 9,
                backgroundColor: "#1F2937",
              }}
            >
              <Text
                testID="onboard-mint"
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 14,
                  fontWeight: "500",
                  lineHeight: 16,
                  color: "white",
                }}
              >
                Mint
              </Text>
            </Pressable>
          </View>
        </View>
        
        {/* Hero */}
        <View
          style={{
            padding: 30,
            backgroundColor: "#F9FAFB",
          }}
        >
          <Text
            style={{
              fontFamily: "Inter_500Medium",
              fontSize: 36,
              fontWeight: "500",
              lineHeight: 40,
              color: "#1F2937",
              marginBottom: 15,
            }}
          >
            Welcome to 3ID! 🎉
          </Text>

          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 16,
              fontWeight: "400",
              lineHeight: 24,
              color: "#6B7280",
              marginBottom: 22,
            }}
          >
            The app is currently in beta. We will be unlocking new features on
            weekly basis. <br />
            Please follow us on Twitter and join our Discord to stay updated!{" "}
          </Text>

          <View
            style={{
              flexDirection: "row",
            }}
          >
            <Pressable
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                paddingHorizontal: 44.5,
                paddingVertical: 12,
                marginRight: 10,
                backgroundColor: "#F3F4F6",
              }}
            >
              <Image
                style={{
                  width: 19,
                  height: 16,
                  marginRight: 13.5,
                }}
                source={require("../../assets/twitter.png")}
              />

              <Text
                testID="onboard-twitter"
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 14,
                  fontWeight: "500",
                  lineHeight: 16,
                }}
              >
                <a
                  target={"_blank"}
                  rel={"noopener noopener noreferrer"}
                  href={Constants.manifest?.extra?.twitterUrl}
                  style={{ color: "#374151", textDecoration: "none" }}
                >
                  Twitter
                </a>
              </Text>
            </Pressable>

            <Pressable
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                paddingHorizontal: 44.5,
                paddingVertical: 12,
                backgroundColor: "#F3F4F6",
              }}
            >
              <Image
                style={{
                  width: 19.82,
                  height: 15.11,
                  marginRight: 13.09,
                }}
                source={require("../../assets/discord.png")}
              />

              <Text
                testID="onboard-twitter"
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 14,
                  fontWeight: "500",
                  lineHeight: 16,
                  color: "#374151",
                }}
              >
                <a
                  target={"_blank"}
                  rel={"noopener noopener noreferrer"}
                  href={Constants.manifest?.extra?.discordUrl}
                  style={{ color: "#374151", textDecoration: "none" }}
                >
                  Discord
                </a>
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Layout>
  );
}
