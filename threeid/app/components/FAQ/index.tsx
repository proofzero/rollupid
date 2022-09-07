import AccordionWhoIsBehind from "./AccordionWhoIsBehind";
import AccordionHowToUse from "./AccordionHowToUse";
import AccordionSellInvite from "./AccordionSellInvite";
import AccordionWhatIsPFP from "./AccordionWhatIsPFP";

import styles from "./FAQ.css";

export const links = () => [{ rel: "stylesheet", href: styles }];

type Account = {
  account: undefined | null | string;
};

const FAQ = ({ account }: Account) => {
  return (
    <div>
      <h2 className="faq-header">FAQ</h2>

      <AccordionHowToUse account={account} defaultExpanded={true} />
      <AccordionSellInvite defaultExpanded={false} />
      <AccordionWhatIsPFP defaultExpanded={false} />
      <AccordionWhoIsBehind defaultExpanded={false} />
    </div>
  );
};

export default FAQ;
