import React from "react";
import { View, Image, Text, useWindowDimensions } from "react-native";
import TradLink from "../TradLink";
import SideMenuItem, { SideMenuItemProps } from "./SideMenuItem";
import { HiOutlineViewGridAdd } from "react-icons/hi";
import {
  BiUser,
  BiAt,
  BiWalletAlt,
  BiHome,
  BiLink,
  BiIdCard,
  BiCog,
} from "react-icons/bi";

type SideMenuProps = {
  nickname: string;
  /** Web2 URL */
  avatarUri?: string;
  /** Default: 48 */
  avatarSize?: number;
};

const sideMenuItems: SideMenuItemProps[] = [
  {
    title: "Dashboard",
    screen: "Onboard",
    Icon: BiHome,
  },
  {
    title: "NFT Gallery",
    Icon: HiOutlineViewGridAdd,
  },
  {
    title: "KYC",
    Icon: BiIdCard,
  },
  {
    title: "Connected dApps",
    Icon: BiLink,
  },
  {
    title: "Settings",
    Icon: BiCog,
  },
];

const SideMenu = ({ nickname, avatarUri, avatarSize = 48 }: SideMenuProps) => {
  const window = useWindowDimensions();

  return (
    <View
      style={{
        width: window.width >= window.height ? 240 : "100%",
        backgroundColor: "#F9FAFB",
        paddingHorizontal: "0.5em",
        paddingVertical: "1.5em",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          marginBottom: 15,
          paddingHorizontal: "0.5em",
        }}
      >
        <Image
          style={{
            width: avatarSize,
            height: avatarSize,
            marginRight: 12,
          }}
          source={
            avatarUri ? { uri: avatarUri } : require("../../assets/avatar.png")
          }
        ></Image>

        <View
          style={{
            justifyContent: "space-between",
          }}
        >
          <Text
            style={{
              marginBottom: 8,
              fontFamily: "Inter_600SemiBold",
              fontSize: 16,
              fontWeight: "600",
              lineHeight: 19.36,
              color: "#1A1B2D",
              flex: 1,
            }}
          >
            {nickname}
          </Text>
        </View>
      </View>

      <View>
        {sideMenuItems.map((smi) => (
          <SideMenuItem key={smi.title} {...smi} />
        ))}
      </View>
    </View>
  );
};

export default SideMenu;
