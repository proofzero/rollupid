import React from "react";
import { View, Image, Text, useWindowDimensions } from "react-native";
import TradLink from "../TradLink";
import SideMenuItem, { SideMenuItemProps } from "./SideMenuItem";
import {
  FaAt,
  FaHome,
  FaIdBadge,
  FaLink,
  FaUser,
  FaWallet,
} from "react-icons/fa";
import { HiOutlineViewGridAdd } from "react-icons/hi";

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
    Icon: FaHome,
  },
  {
    title: "Set PFP",
    Icon: FaUser,
  },
  {
    title: "User Details",
    Icon: FaAt,
  },
  {
    title: "Wallet Accounts",
    Icon: FaWallet,
  },
  {
    title: "NFT Gallery",
    Icon: HiOutlineViewGridAdd,
  },
  {
    title: "KYC",
    Icon: FaIdBadge,
  },
  {
    title: "Connected dApps",
    Icon: FaLink,
  },
];

const SideMenu = ({ nickname, avatarUri, avatarSize = 48 }: SideMenuProps) => {
  const window = useWindowDimensions();

  return (
    <View
      style={{
        width: window.width >= window.height ? 240 : "100%",
        backgroundColor: "#F9FAFB",
        paddingHorizontal: 16,
        paddingVertical: 20,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          marginBottom: 15,
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

          <TradLink screen={"Details"} text={"Visit My Profile"} />
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
