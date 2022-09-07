const dropdown = require("../../assets/dropdown.png");

type options = {
  defaultExpanded: boolean;
};

const AccordionWhatIsPFP = ({ defaultExpanded }: options) => {
  return (
    <div>
      <div className="dropdown">
        <h3 className="faq-header-question">What is my the 3ID PFP?</h3>
        <img className="faq-header-image" src={dropdown} alt="dropdown arrow" />
      </div>
      <p>
        {" "}
        Your 3ID gradient PFP is a soulbound avatar made up of 4 color traits --
        one version color and three common, uncommon, rare and epic colors
        traits. Rarity is decided by several factors.
      </p>
      <ol>
        <li>
          The first color trait probability is based on which popular NFTs you
          currently hold.
        </li>

        <li>
          The second color trait is based on which of our developer collections
          you hold.
        </li>

        <li>The last color trait is based on your ETH balance.</li>
      </ol>
      <p>
        Click{" "}
        <a
          target={"_blank"}
          rel={"noopener noopener noreferrer"}
          href={`https://github.com/kubelt/kubelt/tree/main/nftar`}
        >
          here
        </a>{" "}
        to read the code. Once generated, your 3ID gradient PFP is soul bound to
        your identity. More generations of this PFP will be released
        corresponding with every major version of 3ID.
      </p>
    </div>
  );
};

export default AccordionWhatIsPFP;
