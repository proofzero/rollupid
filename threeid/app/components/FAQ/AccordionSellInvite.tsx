const dropdown = require("../../assets/dropdown.png");

type options = {
  defaultExpanded: boolean;
};

const AccordionSellInvite = ({ defaultExpanded }: options) => {
  return (
    <div>
      <div className="dropdown">
        <h3 className="faq-header-question">Can I sell my invite card?</h3>
        <img className="faq-header-image" src={dropdown} alt="dropdown arrow" />
      </div>
      <p>
        Yes. You can list your invite card on{" "}
        <a
          target={"_blank"}
          rel={"noopener noopener noreferrer"}
          href={`https://opensea.io/collection/3id-invite`}
        >
          OpenSea
        </a>{" "}
        or transfer it to a friend.
      </p>
    </div>
  );
};

export default AccordionSellInvite;
