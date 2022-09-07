const dropdown = require("../../assets/dropdown.png");

type options = {
  account: string | null | undefined;
  defaultExpanded: boolean;
};

const AccordionHowToUse = ({ account, defaultExpanded }: options) => {
  return (
    <div>
      <div className="dropdown">
        <h3 className="faq-header-question">How do I use 3ID?</h3>
        <img className="faq-header-image" src={dropdown} alt="dropdown arrow" />
      </div>
      <p>
        Now that you've claimed your 3ID, other applications can query your
        profile to fetch your public profile details including your avatar. Soon
        you will also be able to promote your profile and NFTs on social media.
      </p>
      <p>
        In our roadmap we have many more features coming including linking
        multiple accounts together, messaging, storage and more.
      </p>
    </div>
  );
};

export default AccordionHowToUse;
