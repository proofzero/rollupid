const dropdown = require("../../assets/dropdown.png");

type options = {
  defaultExpanded: boolean;
};

const AccordionWhoIsBehind = ({ defaultExpanded }: options) => {
  return (
    <div>
      <div className="dropdown">
        <h3 className="faq-header-question">Who is behind this project?</h3>
        <img className="faq-header-image" src={dropdown} alt="dropdown arrow" />
      </div>
      <p>
        3ID is created by{" "}
        <a
          target={"_blank"}
          rel={"noopener noopener noreferrer"}
          href={`https://kubelt.com`}
        >
          Kubelt
        </a>
        , a decentralized application platform, and is inspired by Web3 and the
        digital identity specification. Instead of applications centralizing
        user data, 3ID users like yourself will be able to permission/revoke
        applications to access personal data, messages and more.
        <br />
        <br />
        Our goal is to eliminate email as a basis of online identity and shift
        the norm towards being cryptographic, user-centric and decentralized
        platforms.
      </p>
    </div>
  );
};

export default AccordionWhoIsBehind;
