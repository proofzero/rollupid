import AccordionHowToUse from "./Accordion/AccordionHowToUse";
import AccordionSellInvite from "./Accordion/AccordionSellInvite";
import AccordionWhatIsPFP from "./Accordion/AccordionWhatIsPFP";
import AccordionWhoIsBehind from "./Accordion/AccordionWhoIsBehind";

import { View, useWindowDimensions, Text, Pressable } from "react-native";

import { HiLink } from "react-icons/hi";

import * as Clipboard from "expo-clipboard";

import styled from "styled-components";
import InviteCode from "../../../components/invites/InviteCode";

const CopyLinkWrapper = styled.div`
  &:hover > div {
    background-color: #f3f4f6 !important;
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
  const landscape = window.width >= window.height;

  return (
    <View
      style={{
        flex: 1,
        marginLeft: landscape ? 41 : "1em",
      }}
    >
      {landscape && inviteCode && <InviteCode code={inviteCode} />}

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
