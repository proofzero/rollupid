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
  const isDesktop = useBreakpoint(true, false)
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

      <AccordionHowToUse account={account} defaultExpanded={true} collapsable={!isDesktop}/>
      <AccordionSellInvite defaultExpanded={isDesktop} collapsable={!isDesktop}/>
      <AccordionWhatIsPFP defaultExpanded={isDesktop} collapsable={!isDesktop}/>
      <AccordionWhoIsBehind defaultExpanded={isDesktop} collapsable={!isDesktop}/>
    </View>
  );
};

export default FAQ;
