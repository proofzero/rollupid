import AccordionWhoIsBehind from "./AccordionWhoIsBehind";
import AccordionHowToUse from "./AccordionHowToUse";
import AccordionSellInvite from "./AccordionSellInvite";
import AccordionWhatIsPFP from "./AccordionWhatIsPFP";

type Account = {
  account: undefined | null | string;
  inviteCode: string | undefined;
};

const FAQ = ({ account, inviteCode }: Account) => {
  return (
    <div>
      {inviteCode && <div>Invite code: {inviteCode}</div>}

      <div>FAQ</div>

      <AccordionHowToUse account={account} defaultExpanded={true} />
      <AccordionSellInvite defaultExpanded={false} />
      <AccordionWhatIsPFP defaultExpanded={false} />
      <AccordionWhoIsBehind defaultExpanded={false} />
    </div>
  );
};

export default FAQ;
