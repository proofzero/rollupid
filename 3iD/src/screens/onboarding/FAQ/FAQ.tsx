import AccordionHowToUse from "./Accordion/AccordionHowToUse";
import AccordionSellInvite from "./Accordion/AccordionSellInvite";
import AccordionWhatIsPFP from "./Accordion/AccordionWhatIsPFP";
import AccordionWhoIsBehind from "./Accordion/AccordionWhoIsBehind";

import { View, useWindowDimensions } from "react-native";

type Account = {
  account: undefined | null | string;
};

const FAQ = ({ account }: Account) => {
  const window = useWindowDimensions();
  return (
    <View
      style={{
        flex: 1,
        marginLeft: window.width >= window.height ? 41 : "1em",
      }}
    >
      <AccordionHowToUse account={account} />
      <AccordionSellInvite />
      <AccordionWhatIsPFP />
      <AccordionWhoIsBehind />
    </View>
  );
};

export default FAQ;
