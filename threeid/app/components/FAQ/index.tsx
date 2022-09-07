import AccordionComponent from "./AccordionComponent";

import styles from "./FAQ.css";

export const links = () => [{ rel: "stylesheet", href: styles }];

type Account = {
  account: undefined | null | string;
};

const contents = [
  {
    defaultExpanded: true,
    question: "How do I use 3ID?",
    answer: (
      <div>
        <p>
          Now that you've claimed your 3ID, other applications can query your
          profile to fetch your public profile details including your avatar.
          Soon you will also be able to promote your profile and NFTs on social
          media.
        </p>
        <p>
          In our roadmap we have many more features coming including linking
          multiple accounts together, messaging, storage and more.
        </p>
      </div>
    ),
  },
  {
    defaultExpanded: false,
    question: "Can I sell my invite card?",
    answer: (
      <div>
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
    ),
  },
  {
    defaultExpanded: false,
    question: "What is my the 3ID PFP?",
    answer: (
      <div>
        <p>
          {" "}
          Your 3ID gradient PFP is a soulbound avatar made up of 4 color traits
          -- one version color and three common, uncommon, rare and epic colors
          traits. Rarity is decided by several factors.
        </p>
        <ol>
          <li>
            The first color trait probability is based on which popular NFTs you
            currently hold.
          </li>

          <li>
            The second color trait is based on which of our developer
            collections you hold.
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
          to read the code. Once generated, your 3ID gradient PFP is soul bound
          to your identity. More generations of this PFP will be released
          corresponding with every major version of 3ID.
        </p>
      </div>
    ),
  },
  {
    defaultExpanded: false,
    question: "Who is behind this project?",
    answer: (
      <div>
        <p>
          3ID is created by{" "}
          <a
            target={"_blank"}
            rel={"noopener noopener noreferrer"}
            href={`https://kubelt.com`}
          >
            Kubelt
          </a>
          , a decentralized application platform, and is inspired by Web3 and
          the digital identity specification. Instead of applications
          centralizing user data, 3ID users like yourself will be able to
          permission/revoke applications to access personal data, messages and
          more.
          <br />
          <br />
          Our goal is to eliminate email as a basis of online identity and shift
          the norm towards being cryptographic, user-centric and decentralized
          platforms.
        </p>
      </div>
    ),
  },
];

const FAQ = ({ account }: Account) => {
  return (
    <div>
      <h2 className="faq-header">FAQ</h2>

      {contents.map((content) => (
        <AccordionComponent key={content.question} content={content} />
      ))}
    </div>
  );
};

export default FAQ;
