/// @file: crdt.networks.ts
//
// *Beware: NEVER put real Ether into testing accounts*

// Types
// -----------------------------------------------------------------------------

// This class takes a private key (Metamask export string, as above) in the
// contructor and provides access to the related public key and eth address.
// This avoids having to juggle the private key and address separately because
// ethers Wallets don't have an accessor for the private key.
// TODO: The link between address and key, and address checksum validation can
// be added back, in future. This is re-validated in the config file tasks.
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
  // operator: string;
}

// Container type for private keys for the owner and operator accounts.
// These should come from AccountConfiguration objects.
type WalletConfiguration = {
  ownerKey: string;
  // operatorKey: string;
};

// // This class takes an Alchemy URL which contains the API key as the last path
// // component and provides access to both the url and the key, so that we don't
// // have to juggle separate pieces of equivalent data.
class AlchemyConfiguration {
  #url: string;
  #key: string;

  constructor(_url: string) {
    this.#url = _url;
    this.#key = _url.split('/').pop() || 'Invalid Alchemy url: cannot extract key.';
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
  wallet: WalletConfiguration;
  user: UserConfiguration;
};

// Definitions
// -----------------------------------------------------------------------------

// Profile smart contract address (hardhat local node).
const PROXY_CONTRACT_LOCALHOST = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

// Profile smart contract address (ethereum/goerli).
const PROXY_CONTRACT_GOERLI = "0xF8AbeC91bc462d3F6ACAfF59A5e5c7F4c2dB29Dd";

// Profile smart contract address (polygon/mumbai)
const PROXY_CONTRACT_MUMBAI = "NOT_DEPLOYED";

// Profile smart contract address (polygon/mainnet)
const PROXY_CONTRACT_POLYGON = "NOT_DEPLOYED";

// Profile smart contract address (ethereum/mainnet).
const PROXY_CONTRACT_ETHEREUM = "NOT_DEPLOYED";

// Plugin: ETHERSCAN
// -----------------------------------------------------------------------------

export const ETHERSCAN = {
  apiKey: process.env.CRDT_ETHERSCAN_API_KEY,
};

// NET_LOCALHOST
// -----------------------------------------------------------------------------
// Constants for usage with local hardhat network.

// When running hardhat node, this is always account #0; the private
// key is printed to the console after running $ npx hardhat node.
const localhost_owner = new AccountConfiguration("ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");

// When running hardhat node, this is always account #1; the private
// key is printed to the console after running $ npx hardhat node.
// TODO: We probably want operators. Not hooked up for now.
// const localhost_operator = new AccountConfiguration("59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", "0x70997970C51812dc3A010C7d01b50e0d17dc79C8");

export const NET_LOCALHOST: ChainnetConfiguration = {
  // The address of the deployed smart contract.
  contract: PROXY_CONTRACT_LOCALHOST,
  alchemy: new AlchemyConfiguration("not needed for localhost"),
  wallet: {
    ownerKey: localhost_owner.privateKey,
    // operatorKey: localhost_operator.privateKey,
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
    owner:     localhost_owner.address,
    // operator:  localhost_operator.address,
  },
};

// NET_GOERLI
// -----------------------------------------------------------------------------
// Constants for usage with Goerli test network.
const goerli_owner = new AccountConfiguration(process.env.CRDT_GOERLI_OWNER_PRIVATE, process.env.CRDT_GOERLI_OWNER_ADDRESS);
// TODO: Connect operators in the types up top, then throughout, including here.
// const goerli_operator = new AccountConfiguration("ethereum goerli owner private key not set", "ethereum goerli owner address not set");...

export const NET_GOERLI: ChainnetConfiguration = {
  contract: PROXY_CONTRACT_GOERLI,
  // TODO: Replace either here for $CRDT or create an Alchemy app for Hardhat. 
  alchemy: new AlchemyConfiguration(process.env.CRDT_GOERLI_ALCHEMY_URL),
  wallet: {
    ownerKey: goerli_owner.privateKey,
    // operatorKey: goerli_operator.privateKey,
  },
  user: {
    robert: "0xcAA76924329206bBE87aF88B3240a3828D8b4399",
    alfl: "0x3DaC36FE079e311489c6cF5CC456a6f38FE01A52",
    alex: "0x961B46647E86d412707A71F460Bb59Ddef1a9381",
    zach: "0xE32522f1C48C44c08b108d4958A3909D94781714",
    adrian: "0xd3C1D6adB70d95e51ECE01Ad5614bE8175C05786",
    cosmin: "0x6c60Da9471181Aa54C648c6e201263A5501363F3",
    emil: "0x7a5F6EA3be6dB9dbe2bf436715a278b284ADeF61",
    // Contract management
    owner: goerli_owner.address,
    // operator: goerli_operator.address,
  },
};

// NET_MUMBAI
// -----------------------------------------------------------------------------
// Constants for usage with Polygon testnet network.

// TODO: Replace. This is a compromised hardhat account.
const mumbai_owner = new AccountConfiguration("ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
// TODO: Connect operators in the types up top, then throughout, including here.
// const mumbai_operator = new AccountConfiguration("polygon mumbai operator private key not set", "polygon mumbai operator address not set");

export const NET_MUMBAI: ChainnetConfiguration = {
  contract: PROXY_CONTRACT_MUMBAI,
  // TODO: Replace either here for $CRDT or create an Alchemy app for Hardhat. 
  alchemy: new AlchemyConfiguration(process.env.CRDT_MUMBAI_ALCHEMY_URL),
  wallet: {
    ownerKey: mumbai_owner.privateKey,
    // operatorKey: mumbai_operator.privateKey,
  },
  user: {
    // Contract management
    owner: mumbai_owner.address,
    // operator: mumbai_operator.address,
  },
};

// NET_POLYGON
// -----------------------------------------------------------------------------
// Constants for usage with Polygon mainnet network.

// TODO: Replace. This is a compromised hardhat account.
const polygon_owner = new AccountConfiguration("ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
// TODO: Connect operators in the types up top, then throughout, including here.
// const polygon_operator = new AccountConfiguration("polygon mainnet operator private key not set", "polygon mainnet operator address not set");

export const NET_POLYGON: ChainnetConfiguration = {
  contract: PROXY_CONTRACT_POLYGON,
  // TODO: Replace either here for $CRDT or create an Alchemy app for Hardhat. 
  alchemy: new AlchemyConfiguration(process.env.CRDT_POLYGON_ALCHEMY_URL),
  wallet: {
    ownerKey: polygon_owner.privateKey,
    // operatorKey: polygon_operator.privateKey,
  },
  user: {
    // Contract management
    owner: polygon_owner.address,
    // operator: polygon_operator.address,
  },
};

// NET_MAINNET
// -----------------------------------------------------------------------------
// Constants for usage with Ethereum mainnet network.

// TODO: Replace. This is a compromised hardhat account.
const mainnet_owner = new AccountConfiguration("ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
// TODO: Connect operators in the types up top, then throughout, including here.
// const mainnet_operator = new AccountConfiguration("ethereum mainnet operator private key not set", "ethereum mainnet operator address not set");

export const NET_MAINNET: ChainnetConfiguration = {
  contract: PROXY_CONTRACT_ETHEREUM,
  // TODO: Replace either here for $CRDT or create an Alchemy app for Hardhat. 
  alchemy: new AlchemyConfiguration(process.env.CRDT_ETHEREUM_ALCHEMY_URL),
  wallet: {
    ownerKey: mainnet_owner.privateKey,
    // operatorKey: mainnet_operator.privateKey,
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
    // operator: mainnet_operator.address,
  },
};
