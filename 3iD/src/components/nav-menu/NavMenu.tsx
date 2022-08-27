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
import { FiSettings } from "react-icons/fi";
import { VscSignOut } from "react-icons/vsc";
import { BiCopy } from "react-icons/bi";

import { purge } from "../../provider/kubelt";
import * as Clipboard from "expo-clipboard";
import { clearAccount } from "../../provider/web3";
import { useAppSelector } from "../../hooks/state";
import { selectAddress } from "../../state/slices/profile";
import NavMenuItem from "./NavMenuItem";

import styled from "styled-components";
import useBreakpoint from "../../hooks/breakpoint";

const LinkWrapper = styled.div`
  &:hover {
    background-color: #f3f4f6;
  }

  &:focus {
    box-shadow: 0px 0px 0px 1px #9ca3af;
  }
`;

export default function NavMenu() {
  const [showPanel, setShowPanel] = useState(false);

  const address = useAppSelector(selectAddress);
  const window = useWindowDimensions();

  return (
    <View
      style={{
        paddingVertical: "1em",
        width: Math.min(1400, window.width),
        marginHorizontal: "auto",
        flexDirection: useBreakpoint("row", "column"),
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 2,
        backgroundColor: "#192030",
      }}
    >
      <View
        style={{
          flexDirection: "row",//useBreakpoint("row", "column"),
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
            display: useBreakpoint(false, true) ? "none" : "initial",
            marginLeft: 65,//useBreakpoint(65, 0),
            marginVertical: "1em",
            flexDirection: "row", //useBreakpoint("row", "column"),
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <NavMenuItem title="My Profile" />
          <NavMenuItem title="inb0x" />
          <NavMenuItem title="b0x" />
          <NavMenuItem screen="Onboard" title="Account" />
        </View>
      </View>

      <View>
        <Pressable
          style={{
            display: useBreakpoint(false, true) ? "none" : "initial",
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
              zIndex: 3,
              right: 0,
              shadowRadius: 5,
              shadowColor: "black",
              shadowOpacity: 0.8,
            }}
          >
            <LinkWrapper>
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
                <BiCopy
                  style={{
                    width: 16,
                    height: 16,
                    marginRight: 12,
                  }}
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
            </LinkWrapper>

            {/* <LinkWrapper> */}
            <Pressable
              style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#f3f4f6",
                opacity: 0.5,
              }}
              onPress={() => {
                // (nav as any).navigate("Settings"); // TODO: renable when settings are ready

                setShowPanel(false);
              }}
            >
              <FiSettings
                style={{
                  width: 16,
                  height: 16,
                  marginRight: 12,
                }}
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
            {/* </LinkWrapper> */}

            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <VscSignOut
                style={{
                  width: 195,
                  height: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              />
            </View>

            <LinkWrapper>
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
            </LinkWrapper>
          </View>
        )}
      </View>
    </View>
  );
}
