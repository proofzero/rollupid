import React from "react";
import { HiLink } from "react-icons/hi";
import { Pressable, Text, View } from "react-native";
import styled from "styled-components";
import * as Clipboard from "expo-clipboard";

type InviteCodeProps = {
  code: string;
};

const CopyLinkWrapper = styled.div`
  &:hover > div {
    background-color: #f3f4f6 !important;
  }

  &:focus > div {
    box-shadow: 0px 0px 0px 1px #9ca3af !important;
  }
`;

const InviteCode = ({ code }: InviteCodeProps) => {
  return (
    <>
      <Text
        style={{
          fontFamily: "Inter_600SemiBold",
          fontSize: 20,
          fontWeight: "600",
          lineHeight: 32,
          color: "#1F2937",
        }}
      >
        Invite Friends
      </Text>

      <Text
        style={{
          fontFamily: "Inter_400Regular",
          fontSize: 14,
          fontWeight: "400",
          lineHeight: 20,
          color: "#9CA3AF",
          marginBottom: 20,
        }}
      >
        Share an invite link with your friends
      </Text>

      <View
        style={{
          flexDirection: "row",
          backgroundColor: "#F9FAFB",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            flex: 1,
            fontFamily: "Inter_400Regular",
            fontWeight: "400",
            fontSize: 14,
            lineHeight: 20,
            paddingVertical: 11,
            paddingLeft: 13,
            color: "#9CA3AF",
          }}
        >
          https://get.threeid.xyz/{code}
        </Text>
        <CopyLinkWrapper>
          <Pressable
            disabled={!code}
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#1F2937",
              paddingVertical: 11,
              paddingHorizontal: 17,
            }}
            onPress={async () => {
              await Clipboard.setStringAsync(`https://get.threeid.xyz/${code}`);
            }}
          >
            <HiLink
              style={{
                width: 15,
                height: 15,
                marginRight: 10.5,
                color: "#D1D5DB",
              }}
            />

            <Text
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 14,
                lineHeight: 20,
                color: "#D1D5DB",
              }}
            >
              Copy Link
            </Text>
          </Pressable>
        </CopyLinkWrapper>
      </View>
    </>
  );
};

export default InviteCode;
