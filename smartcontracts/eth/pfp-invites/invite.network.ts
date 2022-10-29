// @file: secret.ts
//
// NB: s3kri7! Don't check this in!
//
// NB: To export your private key from Metamask, open Metamask and go to
// Account Details > Export Private Key.
// *Beware: NEVER put real Ether into testing accounts*

// Removed because of the NFTar deployment requiring a vanilla TS download from 1pass.
// import { ethers } from "ethers";

// Types
// -----------------------------------------------------------------------------

// This class takes a private key (Metamask export string, as above) in the
// contructor and provides access to the related public key and eth address.
// This avoids having to juggle the private key and address separately because
// ethers Wallets don't have an accessor for the private key.
// TODO: Disabled because this file needs to avoid imports (for NFTar deployments).
// TODO: The link between address and key, and address checksum validation can
// be added back, in future. This is re-validated in the config file tasks though.
class AccountConfiguration {
  #key: string;
  #address: string;
  // #wallet: ethers.Wallet;

  constructor(key: string, address: string) {
    this.#key = key;
    this.#address = address;
    // this.#wallet = new ethers.Wallet(key);
    // if (!address) {
    //   console.log(key, this.#wallet.address);
    // } else {
    //   console.log(address, this.#wallet.address, address == this.#wallet.address);
    // }
  }

  get address(): string {
    // return this.#wallet.address;
    return this.#address;
  }

  get privateKey(): string {
    return this.#key;
  }

  // get publicKey(): string {
  //   return this.#wallet.publicKey;
  // }
}

// Basic type for the user list: arbitrary kv tuples mapping names
// to addresses but with owner and operator required.
type UserConfiguration = {
  [key: string]: string;
  owner: string;
  operator: string;
};

// Container type for private keys for the owner and operator accounts.
// These should come from AccountConfiguration objects.
type WalletConfiguration = {
  ownerKey: string;
  operatorKey: string;
};

// Container type for the API key for the nft.storage service.
type StorageConfiguration = {
  apiKey: string;
};

// Basic configuration type for NFTar, an internal service that generates NFT
// avatars and signed lazy minting vouchers.
type NFTarConfiguration = {
  host: string;
  token: string;
};

// This class takes an Alchemy URL which contains the API key as the last path
// component and provides access to both the url and the key, so that we don't
// have to juggle separate pieces of equivalent data.
class AlchemyConfiguration {
  #url: string;
  #key: string;

  constructor(_url: string) {
    this.#url = _url;
    this.#key =
      _url.split("/").pop() || "Invalid Alchemy url: cannot extract key.";
  }

  get apiKey(): string {
    return this.#key;
  }

  get appURL(): string {
    return this.#url;
  }
}

// Composite type for chain-network configurations.
export type ChainnetConfiguration = {
  contract: string;
  alchemy: AlchemyConfiguration;
  nftar: NFTarConfiguration;
  storage: StorageConfiguration;
  wallet: WalletConfiguration;
  user: UserConfiguration;
};

// Definitions
// -----------------------------------------------------------------------------

// Access keys for nft.storage service:

// - token: 3iD-invite
// - account: <nft.storage@kubelt.com>
// - for testing and development (local, goerli, rinkeby, mumbai)
const NFT_STORAGE_KEY_TEST = process.env.NFT_STORAGE_KEY_TEST || "";

// - token: 3iD-invite-mainnet
// - account: <nft.storage@kubelt.com>
// - for production usage (mainnet, polygon)
const NFT_STORAGE_KEY_MAIN = process.env.NFT_STORAGE_KEY_MAIN || "";

// Invite smart contract address (hardhat local node).
const CONTRACT_INVITE_LOCALHOST = "";

// Invite smart contract address (ethereum/goerli).
const CONTRACT_INVITE_GOERLI = "0x90F3AfEE6a835bbE996Ab5546d0c7f7a9611ad2f";

// Invite smart contract address (ethereum/rinkeby).
const CONTRACT_INVITE_RINKEBY = "0x3493F9E191020cABbCDCc07697f74e019292e469";

// Invite smart contract address (ethereum/mainnet).
const CONTRACT_INVITE_ETHEREUM = "0x92cE069c08e39bcA867d45d2Bdc4eBE94e28321a";

// Invite smart contract address (polygon/mumbai)
const CONTRACT_INVITE_MUMBAI = "0x63Ae3576b1164A65dA5294F02F2d01895c7a3056";

// Invite smart contract address (polygon/mainnet)
const CONTRACT_INVITE_POLYGON = "NOT DEPLOYED";

// Application: nftar
// -----------------------------------------------------------------------------
// This application provides minting services for procedurally generated
// gradient PFPs. A testnet and a mainnet version run on Google Cloud
// Platform as two separate Cloud Run instances.

const NFTAR_API_HOST_TESTNET = "test.nftar.threeid.xyz";
const NFTAR_API_TOKEN_TESTNET = process.env.NFTAR_API_TOKEN_TESTNET || "";

// curl -H "Content-Type: application/json" -H "Authorization: Bearer AAABAItp+ggoBM6s8lQTAMQbLT1iXjYsImidnm788BPinZz08g==" -X POST -d '{"jsonrpc":"2.0","id":"1","method":"3id_genPFP","params":{"account": "0xd3C1D6adB70d95e51ECE01Ad5614bE8175C05786", "blockchain": {"name": "ethereum", "chainId": 5}}}' https://test.nftar.threeid.xyz/api

const NFTAR_API_HOST_MAINNET = "nftar.threeid.xyz";
const NFTAR_API_TOKEN_MAINNET = process.env.NFT_API_TOKEN_MAINNET || "";

// Used in the blockchain network configurations below.
const NFTAR_CONFIG_TESTNET = {
  // Host at which test nftar service API is exposed.
  host: NFTAR_API_HOST_TESTNET,
  // Bearer token used to authenticate to nftar TESTNET service.
  token: NFTAR_API_TOKEN_TESTNET,
};

// Used in the blockchain network configurations below.
const NFTAR_CONFIG_MAINNET = {
  // Host at which test nftar service API is exposed.
  host: NFTAR_API_HOST_MAINNET,
  // Bearer token used to authenticate to nftar MAINNET service.
  token: NFTAR_API_TOKEN_MAINNET,
};

export const NFTAR = {
  // Google Cloud Platform-related configuration.
  gcp: {
    // The GCP project identifier where the nftar service is deployed.
    project: "threeid-nftar",
    // The GCP region where we deploy all supported resources.
    region: "northamerica-northeast2",
  },
  // Test configuration; deployed test environment application using
  // Ethereum goerli testnet.
  testnet: {
    alchemy: {
      network: "ETH_GOERLI",
    },
    chain: {
      name: "ethereum",
      id: "5",
    },
    docker: {
      image: "8aa862a44e2f6581f32293bb63d99531dddcf82bdea05ad7375c6d3cffed4165",
    },
    oort: {
      host: "oort-testnet.kubelt.com",
    },
    api: {
      host: NFTAR_API_HOST_TESTNET,
    },
    contract: {
      invite: CONTRACT_INVITE_GOERLI,
    },
  },
  // Production configuration; deployed production environment
  // application using Ethereum mainnet.
  mainnet: {
    alchemy: {
      network: "ETH_MAINNET",
    },
    chain: {
      name: "ethereum",
      id: "1",
    },
    docker: {
      image: "8aa862a44e2f6581f32293bb63d99531dddcf82bdea05ad7375c6d3cffed4165",
    },
    oort: {
      host: "oort-mainnet.kubelt.com",
    },
    api: {
      host: NFTAR_API_HOST_MAINNET,
    },
    contract: {
      invite: CONTRACT_INVITE_ETHEREUM,
    },
  },
};

// Plugin: ETHERSCAN
// -----------------------------------------------------------------------------

export const ETHERSCAN = {
  apiKey: process.env.ETHERSCAN || "",
};

// NET_LOCALHOST
// -----------------------------------------------------------------------------
// Constants for usage with local hardhat network.

// When running hardhat node, this is always account #0; the private
// key is printed to the console after running $ npx hardhat node.
const localhost_owner = new AccountConfiguration(
  process.env.LOCALHOST_OWNER_PK || "",
  "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
);

// When running hardhat node, this is always account #1; the private
// key is printed to the console after running $ npx hardhat node.
const localhost_operator = new AccountConfiguration(
  process.env.LOCALHOST_OPERATOR_PK || "",
  "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
);

export const NET_LOCALHOST: ChainnetConfiguration = {
  // The address of the deployed invite smart contract.
  contract: CONTRACT_INVITE_LOCALHOST,
  alchemy: new AlchemyConfiguration("not needed for localhost"),
  nftar: NFTAR_CONFIG_TESTNET,
  storage: {
    // An API key for nft.storage; used for immutable storage of NFT
    // assets on IPFS.
    apiKey: NFT_STORAGE_KEY_TEST,
  },
  wallet: {
    ownerKey: localhost_owner.privateKey,
    operatorKey: localhost_operator.privateKey,
  },
  user: {
    // These are the standard collection of hardhat accounts aliased to
    // human-readable names; when using the CLI they can be supplied as
    // arguments to --account parameters as a convenience.
    account0: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    account1: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    account2: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    account3: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    account4: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    account5: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
    account6: "0x976EA74026E726554dB657fA54763abd0C3a0aa9",
    account7: "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955",
    account8: "0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f",
    account9: "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720",
    account10: "0xBcd4042DE499D14e55001CcbB24a551F3b954096",
    account11: "0x71bE63f3384f5fb98995898A86B02Fb2426c5788",
    account12: "0xFABB0ac9d68B0B445fB7357272Ff202C5651694a",
    account13: "0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec",
    account14: "0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097",
    account15: "0xcd3B766CCDd6AE721141F452C550Ca635964ce71",
    account16: "0x2546BcD3c84621e976D8185a91A922aE77ECEc30",
    account17: "0xbDA5747bFD65F08deb54cb465eB87D40e51B197E",
    account18: "0xdD2FD4581271e230360230F9337D5c0430Bf44C0",
    account19: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
    // Contract management -- these are account0 and account1, above.
    owner: localhost_owner.address,
    operator: localhost_operator.address,
  },
};

// NET_GOERLI
// -----------------------------------------------------------------------------
// Constants for usage with Goerli test network.

const goerli_owner = new AccountConfiguration(
  process.env.GOERLI_OWNER_PK || "",
  "0xe30955717e63217a2E024255e6E1e62979aCBA37"
);
const goerli_operator = new AccountConfiguration(
  process.env.GOERLI_OPERATOR_PK || "",
  "0x274a8B441c231902aED4e2Fc8BaCBcfA16724fcD"
);

export const NET_GOERLI: ChainnetConfiguration = {
  contract: CONTRACT_INVITE_GOERLI,
  alchemy: new AlchemyConfiguration(
    "https://eth-goerli.g.alchemy.com/v2/hWciAnk0yAHpFwtjRbr5zvShiAxlccHx"
  ),
  nftar: NFTAR_CONFIG_TESTNET,
  storage: {
    apiKey: NFT_STORAGE_KEY_TEST,
  },
  wallet: {
    ownerKey: goerli_owner.privateKey,
    operatorKey: goerli_operator.privateKey,
  },
  user: {
    robert: "0xcAA76924329206bBE87aF88B3240a3828D8b4399",
    alex: "0x3DaC36FE079e311489c6cF5CC456a6f38FE01A52",
    zach: "0xE32522f1C48C44c08b108d4958A3909D94781714",
    adrian: "0xd3C1D6adB70d95e51ECE01Ad5614bE8175C05786",
    cosmin: "0x6c60Da9471181Aa54C648c6e201263A5501363F3",
    emil: "0x7a5F6EA3be6dB9dbe2bf436715a278b284ADeF61",
    // Contract management
    owner: goerli_owner.address,
    operator: goerli_operator.address,
  },
};

// NET_MUMBAI
// -----------------------------------------------------------------------------
// Constants for usage with Polygon testnet network.
const mumbai_owner = new AccountConfiguration(
  process.env.MUMBAI_OWNER_PK || "",
  "0x13AB3c16E07D1EeB2129D1125124FC4e74D6bce7"
);
const mumbai_operator = new AccountConfiguration(
  process.env.MUMBAI_OPERATOR_PK || "",
  "0x1A94f21485C79CD0bf890971156aaFb8FD7D96a7"
);

export const NET_MUMBAI: ChainnetConfiguration = {
  contract: CONTRACT_INVITE_MUMBAI,
  alchemy: new AlchemyConfiguration(
    "https://polygon-mumbai.g.alchemy.com/v2/4nCB9TJyDee2dp_cX_1QcXuAjwqG2SlN"
  ),
  nftar: NFTAR_CONFIG_TESTNET,
  storage: {
    apiKey: NFT_STORAGE_KEY_TEST,
  },
  wallet: {
    ownerKey: mumbai_owner.privateKey,
    operatorKey: mumbai_operator.privateKey,
  },
  user: {
    // Contract management
    owner: mumbai_owner.address,
    operator: mumbai_operator.address,
  },
};

// NET_POLYGON
// -----------------------------------------------------------------------------
// Constants for usage with Polygon mainnet network.

const polygon_owner = new AccountConfiguration(
  process.env.POLYGON_OWNER_PK || "",
  "0xD0589Bf1D60F52176d10041e35f6103766f7cb76"
);
const polygon_operator = new AccountConfiguration(
  process.env.POLYGON_OPERATOR_PK || "",
  "0x9bD7F1F873bb00A83771611574478134B80cB620"
);

export const NET_POLYGON: ChainnetConfiguration = {
  contract: CONTRACT_INVITE_POLYGON,
  alchemy: new AlchemyConfiguration(
    "https://polygon-mainnet.g.alchemy.com/v2/ndJxhpfvQ_RAhrkDTGOkwkdKtTXXSeZq"
  ),
  nftar: NFTAR_CONFIG_MAINNET,
  storage: {
    apiKey: NFT_STORAGE_KEY_MAIN,
  },
  wallet: {
    ownerKey: polygon_owner.privateKey,
    operatorKey: polygon_operator.privateKey,
  },
  user: {
    // Contract management
    owner: polygon_owner.address,
    operator: polygon_operator.address,
  },
};

// NET_MAINNET
// -----------------------------------------------------------------------------
// Constants for usage with Ethereum mainnet network.

const mainnet_owner = new AccountConfiguration(
  process.env.MAINNET_OWNER_PK || "",
  "0xBB9cC1a8455A304762aD8A568444057F47f9F1A5"
);
const mainnet_operator = new AccountConfiguration(
  process.env.MAINNET_OPERATOR_PK || "",
  "0xAb79A45B653091633BB6D0930fc2e21B17B1D255"
);

export const NET_MAINNET: ChainnetConfiguration = {
  contract: CONTRACT_INVITE_ETHEREUM,
  alchemy: new AlchemyConfiguration(
    "https://eth-mainnet.g.alchemy.com/v2/SEljrsFKWzJfPiXdA0SukbcK6NA5hhoE"
  ),
  nftar: NFTAR_CONFIG_MAINNET,
  storage: {
    apiKey: NFT_STORAGE_KEY_MAIN,
  },
  wallet: {
    ownerKey: mainnet_owner.privateKey,
    operatorKey: mainnet_operator.privateKey,
  },
  user: {
    alex: "0x3DaC36FE079e311489c6cF5CC456a6f38FE01A52",
    cosmin: "0x6c60Da9471181Aa54C648c6e201263A5501363F3",
    ondrej: "0x012AC2a88F9244f004255b29AFCD349beE097B48",
    robert: "0xC95285E7F863a320ca0D12dd4021c5688d3d75b2",
    sonmez: "0x23D39B5B7bd481f9e7F9685F276D302987D29426",
    zach: "0xE32522f1C48C44c08b108d4958A3909D94781714",
    emil: "0x7a5F6EA3be6dB9dbe2bf436715a278b284ADeF61",
    // Contract management
    owner: mainnet_owner.address,
    operator: mainnet_operator.address,
  },
};
