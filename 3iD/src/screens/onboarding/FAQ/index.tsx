import AccordionHowToUse from "./Accordion/AccordionHowToUse";
import AccordionSellInvite from "./Accordion/AccordionSellInvite";
import AccordionWhatIsPFP from "./Accordion/AccordionWhatIsPFP";
import AccordionWhoIsBehind from "./Accordion/AccordionWhoIsBehind";

import { View, Text } from "react-native";

import InviteCode from "../../../components/invites/InviteCode";
import useBreakpoint from "../../../hooks/breakpoint";

type Account = {
  account: undefined | null | string;
  inviteCode: string | undefined;
};

const FAQ = ({ account, inviteCode }: Account) => {
  return (
    <View
      style={{
        flex: 1,
        marginLeft: useBreakpoint<number | string>(41, "1em"),
      }}
    >
      {useBreakpoint(true, false) && inviteCode && (
        <InviteCode code={inviteCode} />
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

      <AccordionHowToUse account={account} defaultExpanded={true} />
      <AccordionSellInvite defaultExpanded={true} />
      <AccordionWhatIsPFP defaultExpanded={true} />
      <AccordionWhoIsBehind defaultExpanded={true} />
    </View>
  );
};

export default FAQ;
