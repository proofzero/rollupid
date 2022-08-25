import AccordionHowToUse from "./Accordion/AccordionHowToUse";
import AccordionSellInvite from "./Accordion/AccordionSellInvite";
import AccordionWhatIsPFP from "./Accordion/AccordionWhatIsPFP";
import AccordionWhoIsBehind from "./Accordion/AccordionWhoIsBehind";

import { View, useWindowDimensions, Text, Pressable } from "react-native";

import { HiLink } from "react-icons/hi";

import * as Clipboard from "expo-clipboard";

import styled from "styled-components";


const CopyLinkWrapper = styled.div`
  &:hover > div {
    background-color: #F3F4F6 !important;
  }

  &:focus > div {
    box-shadow: 0px 0px 0px 1px #9ca3af !important;
  }
`;

type Account = {
  account: undefined | null | string;
  inviteCode: string | undefined;
};

const FAQ = ({ account, inviteCode }: Account) => {
  const window = useWindowDimensions();
  return (
    <View
      style={{
        flex: 1,
        marginLeft: window.width >= window.height ? 41 : "1em",
      }}
    >
      {inviteCode && (
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
              https://get.threeid.xyz/{inviteCode}
            </Text>
            <CopyLinkWrapper>
              <Pressable
                disabled={!inviteCode}
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "#1F2937",
                  paddingVertical: 11,
                  paddingHorizontal: 17,
                }}
                onPress={async () => {
                  await Clipboard.setStringAsync(
                    `https://get.threeid.xyz/${inviteCode}`
                  );
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
      )}
      <Text
        style={{
          fontFamily: "Inter_600SemiBold",
          fontSize: 20,
          fontWeight: "600",
          lineHeight: 32,
          color: "#1F2937",
          marginBottom: 16,
          marginTop: 23,
        }}
      >
        FAQ
      </Text>

      <AccordionHowToUse account={account} />
      <AccordionSellInvite />
      <AccordionWhatIsPFP />
      <AccordionWhoIsBehind />
    </View>
  );
};

export default FAQ;
