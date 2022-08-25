import React, { useState } from "react";
import {
  View,
  Image,
  Pressable,
  Text,
  useWindowDimensions,
} from "react-native";
import {
  Link,
  useNavigation,
  useNavigationState,
} from "@react-navigation/native";

import { HiChevronDown } from "react-icons/hi";

import { purge } from "../../provider/kubelt";
import * as Clipboard from "expo-clipboard";
import { clearAccount } from "../../provider/web3";
import { useAppSelector } from "../../hooks/state";
import { selectAddress } from "../../state/slices/profile";
import NavMenuItem from "./NavMenuItem";

export default function NavMenu() {
  const [showPanel, setShowPanel] = useState(false);

  const address = useAppSelector(selectAddress);

  const nav = useNavigation();
  const window = useWindowDimensions();

  return (
    <View
      style={{
        paddingVertical: "1em",
        paddingHorizontal: window.width >= window.height ? "5em" : "0.5em",
        flexDirection: window.width >= window.height ? "row" : "column",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 1,
        backgroundColor: "#192030",
      }}
    >
      <View
        style={{
          flexDirection: window.width >= window.height ? "row" : "column",
          alignItems: "center",
        }}
      >
        <Image
          style={{
            width: 36.56,
            height: 41.05,
          }}
          source={require("../../assets/three-id-logo-white.svg")}
        />

        <View
          style={{
            marginLeft: window.width >= window.height ? 65 : 0,
            marginVertical: "1em",
            flexDirection: window.width >= window.height ? "row" : "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <NavMenuItem screen="Details" title="My Profile" />
          <NavMenuItem screen="Settings" title="Account" />
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
              paddingHorizontal: 20,
              fontFamily: "Inter_500Medium",
              fontSize: 16,
              fontWeight: "500",
              lineHeight: 16,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {`${address?.substring(0, 4)}...${address?.substring(
              address.length - 4
            )}`}{" "}
            <HiChevronDown
              style={{
                marginLeft: "0.5em",
              }}
            />
          </Text>
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
                await Clipboard.setStringAsync(`${address}`);
                setShowPanel(false);
              }}
            >
              <Image
                style={{
                  width: 16,
                  height: 16,
                  marginRight: 12,
                }}
                source={require("../../assets/copy.png")}
              />
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 16,
                  fontWeight: "500",
                  lineHeight: 16,
                }}
                testID="nav-copy-address"
              >
                Copy address
              </Text>
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
                source={require("../../assets/cog.png")}
              />
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 16,
                  fontWeight: "500",
                  lineHeight: 16,
                }}
                testID="nav-go-to-settings"
              >
                Settings
              </Text>
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
                source={require("../../assets/spacer_195.png")}
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
                source={require("../../assets/logout.png")}
              />
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 16,
                  fontWeight: "500",
                  lineHeight: 16,
                }}
                testID="nav-logout"
              >
                Sign out
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}
