import React, { useState } from "react";
import { View, Image, Pressable, Text } from "react-native";
import {
  Link,
  useNavigation,
  useNavigationState,
} from "@react-navigation/native";
import useAccount from "../hooks/account";
import { purge } from "../provider/kubelt";
import * as Clipboard from "expo-clipboard";
import { clearAccount } from "../provider/web3";

export default function NavMenu() {
  const [showPanel, setShowPanel] = useState(false);

  const account = useAccount();

  const nav = useNavigation();

  const navRoutes = useNavigationState((state) => state.routes);
  const navIndex = useNavigationState((state) => state.index);

  return (
    <View
      style={{
        marginBottom: "3em",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 1,
      }}
    >
      <View
        style={{
          flexDirection: "row",
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

        <View
          style={{
            marginLeft: 65,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Link
            style={{
              marginLeft: 25,
              paddingHorizontal: 12,
              paddingVertical: 8,
              backgroundColor:
                navRoutes[navIndex].name === "Settings"
                  ? "#373F52"
                  : "transparent",
            }}
            to={{ screen: "Settings" }}
          >
            <Text
              style={{
                fontFamily: "Manrope_500Medium",
                fontSize: 18,
                lineHeight: 20,
                color: "white",
              }}
            >
              Settings
            </Text>
          </Link>
        </View>
      </View>

      <View>
        <Pressable
          style={{
            paddingHorizontal: 13.5,
            paddingVertical: 14,
            backgroundColor: "#FFFFFF",
            maxWidth: "100%",
            height: 48,
          }}
          onPress={() => setShowPanel(!showPanel)}
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

        {showPanel && (
          <View
            style={{
              position: "absolute",
              width: 224,
              backgroundColor: "white",
              top: 60,
              zIndex: 2,
              right: 0,
              shadowRadius: 5,
              shadowColor: "black",
              shadowOpacity: 0.8,
            }}
          >
            <Pressable
              style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                flexDirection: "row",
                alignItems: "center",
              }}
              onPress={async () => {
                await Clipboard.setStringAsync(`${account}`);
                setShowPanel(false);
              }}
            >
              <Image
                style={{
                  width: 16,
                  height: 16,
                  marginRight: 12,
                }}
                source={require("../assets/copy.png")}
              />
              <Text testID="nav-copy-address">Copy address</Text>
            </Pressable>

            <Pressable
              style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                flexDirection: "row",
                alignItems: "center",
              }}
              onPress={() => {
                (nav as any).navigate("Settings");

                setShowPanel(false);
              }}
            >
              <Image
                style={{
                  width: 16,
                  height: 16,
                  marginRight: 12,
                }}
                source={require("../assets/cog.png")}
              />
              <Text testID="nav-go-to-settings">Settings</Text>
            </Pressable>

            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image
                style={{
                  width: 195,
                  height: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                source={require("../assets/spacer_195.png")}
              />
            </View>

            <Pressable
              style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                flexDirection: "row",
                alignItems: "center",
              }}
              onPress={() => {
                purge();
                clearAccount();
              }}
            >
              <Image
                style={{
                  width: 16,
                  height: 16,
                  marginRight: 12,
                }}
                source={require("../assets/logout.png")}
              />
              <Text testID="nav-logout">Sign out</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}
