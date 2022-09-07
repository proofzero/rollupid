// eth/profile.config.ts

import * as cheerio from "cheerio";
import * as path from "path";
import chalk from 'chalk';
import fs from "fs";
import https from "node:https";
import url from "node:url";
import { NFTStorage, File } from "nft.storage";
import { createAlchemyWeb3 } from "@alch/alchemy-web3";
import { HardhatUserConfig } from "hardhat/types";
import { subtask, task, types } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-solhint";

import {
  // Plugin configuration
  ETHERSCAN,
  // Network-specific configuration
  NET_LOCALHOST,
  NET_GOERLI,
  NET_RINKEBY,
  NET_MUMBAI,
  NET_POLYGON,
  NET_MAINNET,
  // Types
  ChainnetConfiguration,
} from "./profile.secret";
import { request } from "http";

// definitions
// -----------------------------------------------------------------------------

// The location for generated assets.
const OUTPUT_DIR = path.resolve("outputs");

// Chain IDs are added to hardhat configuration to perform an additional
// bit of validation that you're talking to the network you think you're
// talking to.
const MAINNET_CHAIN_ID = 1;
const RINKEBY_CHAIN_ID = 4;
const GOERLI_CHAIN_ID = 5;
const MUMBAI_CHAIN_ID = 80001;
const POLYGON_CHAIN_ID = 137;

// SUBTASKS
// -----------------------------------------------------------------------------
// cf. https://hardhat.org/hardhat-runner/docs/advanced/create-task
//
// * The only requirement for writing a task is that the Promise returned
//   by its action must not resolve before every async process it started
//   is finished.
//
// The task() function signature:
// - task name
// - task description
// - callback(...)
//   - taskArguments: an object with parsed CLI arguments
//   - hre: the Hardhat Runtime Environment
//   - runSuper: when overriding an existing task, allows to invoke the
//     super implementation

subtask("network:config", "Return network-specific configuration map")
  .setAction(async (taskArgs, hre) => {
    switch (hre.network.name) {
      case "localhost":
        return NET_LOCALHOST;
        break;
      case "goerli":
        return NET_GOERLI;
        break;
      case "rinkeby":
        return NET_RINKEBY;
        break;
      case "mumbai":
        return NET_MUMBAI;
        break;
      case "polygon":
        return NET_POLYGON;
        break;
      case "mainnet":
        return NET_MAINNET;
        break;
      default:
        throw "no configuration defined";
    }
  });

subtask("profile:contract", "Return contract address for selected network")
  .addOptionalParam("contract", "A contract address")
  .setAction(async (taskArgs, hre) => {
    const contract = taskArgs.contract;
    if (contract && (contract.startsWith("0x") || contract.endsWith(".eth"))) {
      return contract;
    } else {
      const config: ChainnetConfiguration = await hre.run("network:config");
      return config.contract;
    }
  });

subtask("config:nftar", "Get the NFTar config")
  .setAction(async (taskArgs, hre) => {
    const config: ChainnetConfiguration = await hre.run("network:config");
    return config.nftar;
});

subtask("config:account", "Return account address for selected network")
  .addParam("account", "An account name or address")
  .setAction(async (taskArgs, hre) => {
    const account = taskArgs.account;
    // If user supplied an account address (0x...) or ENS name (X.eth),
    // use it. Otherwise, try mapping the supplied string to a
    // configured account. If that fails, we have no account to work
    // with, spill spaghetti.
    if (account.startsWith("0x") || account.endsWith(".eth")) {
      return account;
    } else {
      const config = await hre.run("network:config");
      const result = config.user[account];
      if (result) {
        return result;
      } else {
        throw `no such ${hre.network.name} account: ${account}`;
      }
    }
  });

subtask("config:alchemyURL", "Return alchemy application URL")
  .setAction(async (taskArgs, hre) => {
    const config: ChainnetConfiguration = await hre.run("network:config");
    // NB: This dereference will fail for localhost -- no alchemy config.
    // Hard-failing is acceptable for CLI so leaving it. Could check the
    // dereferences and intelligently exit, but ¯\_(ツ)_/¯
    return config.alchemy.appURL;
  });

subtask("config:storageKey", "Return nft.storage API key")
  .setAction(async (taskArgs, hre) => {
    const config = await hre.run("network:config");
    return config.storage.apiKey;
  });

subtask("config:operator:privateKey", "Return operator wallet private key")
  .setAction(async (taskArgs, hre) => {
    const config = await hre.run("network:config");
    return config.wallet.operatorKey;
  });

subtask("config:owner:privateKey", "Return owner wallet private key")
  .setAction(async (taskArgs, hre) => {
    const config = await hre.run("network:config");
    return config.wallet.ownerKey;
  });

subtask("call:maxPFPs", `Return result of ThreeId_ProfilePicture.maxProfiles()`)
  .addParam("contract", "The address of the contract")
  .setAction(async (taskArgs, hre) => {
    const contract = taskArgs.contract;
    const profile = await hre.ethers.getContractAt('ThreeId_ProfilePicture', contract);
    return profile.maxProfiles();
  });

subtask("call:ownerOf", 'Return result of ownerOf(tokenId) on the given contract')
  .addParam("contract", "The address of the contract")
  .addParam("profileId", "The profile number")
  .setAction(async (taskArgs, hre) => {
    const contract = taskArgs.contract;
    const contractName = "ThreeId_ProfilePicture";
    const profileId = taskArgs.profileId;
    const profile = await hre.ethers.getContractAt(contractName, contract);
    return profile.ownerOf(profileId);
  });

subtask("call:tokenURI", 'Return result of tokenURI(tokenId) on the given contract')
  .addParam("contract", "The address of the contract")
  .addParam("profileId", "The profile number")
  .setAction(async (taskArgs, hre) => {
    const contract = taskArgs.contract;
    const contractName = "ThreeId_ProfilePicture";
    const profileId = taskArgs.profileId;
    const profile = await hre.ethers.getContractAt(contractName, contract);
    return profile.tokenURI(profileId);
  });

subtask("call:nextProfile", "Return the ID of next profile")
  .addParam("contract", "The address of the contract")
  .setAction(async (taskArgs, hre) => {
    const contract = taskArgs.contract;
    const contractName = "ThreeId_ProfilePicture";
    const profile = await hre.ethers.getContractAt(contractName, contract);
    return profile.nextPFP();
  });

subtask("call:awardProfile", "Mint PFP NFT")
  .addParam("account", "The address for which to generate a profile picture")
  .addParam("contract", "The profile smart contract address")
  .addParam("tokenUri", "The URI to set for the PFP")
  .addParam("voucher", "The signed voucher")
  .setAction(async (taskArgs, hre) => {
    const account = await hre.run("config:account", { account: taskArgs.account });
    const contract = taskArgs.contract;
    const tokenURI = taskArgs.tokenUri;
    
    // HAXX
    const voucher = JSON.parse(taskArgs.voucher);

    const contractName = "ThreeId_ProfilePicture";

    const profile = await hre.ethers.getContractAt(contractName, contract);
    return profile.awardPFP(account, voucher);
  });

subtask("storage:url", "Returns IPFS gateway URL instance for CID and path")
  .addParam("cid", "The CID for content stored in IPFS")
  .addParam("path", "URL path component")
  .setAction(async (taskArgs, hre) => {
    const cid = taskArgs.cid;
    const path = taskArgs.path;
    let url = new URL(`https://${cid}.ipfs.nftstorage.link`);
    url.pathname = path;
    return url;
  });

subtask("fetch:metadata", "Display the metadata for the profile")
  .addParam("contract", "The contract address")
  .addParam("profileId", "The profile # to check")
  .setAction(async (taskArgs, hre) => {
    const contract = taskArgs.contract;
    const profileId = taskArgs.profileId;
    const uri = await hre.run("call:tokenURI", { contract, profileId });

    // The uri looks something like ipfs://<cid>/metadata.json.
    const cid = (new URL(uri)).host;
    const url = await hre.run("storage:url", { cid, path: "/metadata.json" });

    return new Promise((resolve, reject) => {
      https.get(url.href, (res) => {
        const { statusCode } = res;

        res.setEncoding('utf8');

        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
          const parsedData = JSON.parse(rawData);
          resolve(parsedData);
        });
      }).on('error', (e) => {
        let message;
        if (e instanceof Error) {
          message = e.message;
        } else {
          message = String(e);
        }
        console.error(message);
        reject(message);
      });
    });
  });

task("profile:generate-payload", "Call NFTar to get the custom NFT asset and signed voucher")
  .addParam("account", "The recipient wallet address")
  .setAction(async (taskArgs, hre) => {
    const account = await hre.run("config:account", { account: taskArgs.account });

    // Currently 'ethereum' is required by NFTar.
    let chainName = 'ethereum';
    let chainId = hre.network.config.chainId;

    // If we're testing locally, force an arbitrary ethereum testnet.
    if (hre.network.name == 'localhost') {
      chainId = GOERLI_CHAIN_ID;
    }

    // These will cause NFTar to error, but this is more correct.
    // Most correct would be NFTar accepting chain and network names.
    if (hre.network.name == 'mumbai' || hre.network.name == 'polygon') {
      chainName = 'polygon';
    }

    return hre.run("config:nftar").then(async (config) => {
      return new Promise((resolve, reject) => {
        const url = ['https:/', config.host, 'api'].join('/');
        const request = https.request(url, {
          method: "POST",
          headers: {
            'authorization': 'Bearer ' + config.token,
            'content-type': 'application/json'
          }
        }, (res) => {
          const { statusCode } = res;
  
          res.setEncoding('utf8');
  
          let rawData = '';
          res.on('data', (chunk) => { rawData += chunk; });
          res.on('end', () => {
            const parsedData = JSON.parse(rawData);
            console.log(JSON.stringify(parsedData));
            resolve(parsedData);
          });
        }).on('error', (e) => {
          let message;
          if (e instanceof Error) {
            message = e.message;
          } else {
            message = String(e);
          }
          console.error(message);
          reject(message);
        });

        request.end(JSON.stringify({
          jsonrpc: "2.0",
          id: "1",
          method: "3id_genPFP",
          params: {
            account: account,
            blockchain: {
              name: chainName, // Currently only 'ethereum' is accepted by NFTar.
              chainId: chainId,
            }
          }
        }));
      });
    });
  });

// TASKS
// -----------------------------------------------------------------------------

task("accounts:list", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task("account:balance", "Prints an account balance")
  .addParam("account", "The account address")
  .setAction(async (taskArgs, hre) => {
    const account = await hre.run("config:account", { account: taskArgs.account });
    const balance = await hre.ethers.provider.getBalance(account);

    console.log(hre.ethers.utils.formatEther(balance), chalk.cyan("ETH"));
  });

task("account:nfts", "Gets the NFTs for an account (via Alchemy)")
  .addParam("account", "The account address")
  .setAction(async (taskArgs, hre) => {
    // If given an account (0x...) it is returned, and if given a string attempt to
    // look it up in network-specific configuration and return an account address.
    const account = await hre.run("config:account", { account: taskArgs.account });
    const alchemyURL = await hre.run("config:alchemyURL");

    // Construct the Alchemy client.
    const web3 = createAlchemyWeb3(alchemyURL);

    // The wallet address we want to query for NFTs:
    const nfts = await web3.alchemy.getNfts({
      owner: account,
      // Array of contract addresses to filter the responses with. Max. 20.
      //contractAddresses: [],
    });

    console.log(`> found ${nfts.totalCount} NFTs for account:`, account);

    // Print contract address and tokenId for each NFT:
    for (const nft of nfts.ownedNfts) {
      const response = await web3.alchemy.getNftMetadata({
        contractAddress: nft.contract.address,
        tokenId: nft.id.tokenId,
      });
      // Uncomment this line to see the full api response:
      // console.log(response);
      console.log(chalk.red("NFT"));
      console.log(chalk.green("-> contract:"), nft.contract.address);
      console.log(chalk.green("-> token ID:"), nft.id.tokenId);
      console.log(chalk.green("->     name:"), response.title);
      console.log(chalk.green("->     type:"), response.id?.tokenMetadata?.tokenType);
      console.log(chalk.green("->      uri:"), response.tokenUri?.gateway);
      console.log(chalk.green("->    image:"), response.metadata?.image);
      console.log(chalk.green("->  updated:"), response.timeLastUpdated);
    }
  });

task("profile:maximum", "Return maximum number of profiles")
  .addOptionalParam("contract", "The profile contract address")
  .setAction(async (taskArgs, hre) => {
    const contract = await hre.run("profile:contract", { contract: taskArgs.contract });
    const maxPFPs = await hre.run("call:maxPFPs", { contract });

    console.log(`> maximum ${maxPFPs} profiles`);
  });

task("profile:next", "Return ID of next profile that will be awarded")
  .addOptionalParam("contract", "The profile contract address")
  .setAction(async (taskArgs, hre) => {
    const contract = await hre.run("profile:contract", { contract: taskArgs.contract });
    const nextProfile = await hre.run("call:nextProfile", { contract });

    console.log(`> next profile is #${nextProfile.toString().padStart(4, "0")}`);
  });

task("profile:owner", "Return owner of a profile")
  .addOptionalParam("contract", "The contract address")
  .addParam("profileId", "The profile # to check")
  .setAction(async (taskArgs, hre) => {
    const contract = await hre.run("profile:contract", { contract: taskArgs.contract });
    const profileId = taskArgs.profileId;

    const owner = await hre.run("call:ownerOf", { contract, profileId });

    console.log(chalk.red("OWNER"));
    console.log(chalk.green("-> contract:"), contract);
    console.log(chalk.green("->  profile:"), `#${profileId.toString().padStart(4, "0")}`);
    console.log(chalk.green("->    owner:"), owner);
  });

task("profile:metadata", "Display the metadata for a profile picture")
  .addOptionalParam("contract", "The contract address")
  .addParam("profileId", "The profile # to check")
  .setAction(async (taskArgs, hre) => {
    const contract = await hre.run("profile:contract", { contract: taskArgs.contract });
    const profileId = taskArgs.profileId;

    const metadata = await hre.run("fetch:metadata", { contract, profileId });
    console.log(metadata);
  });

task("profile:image", "Print the image URL for a PFP")
  .addOptionalParam("contract", "The contract address")
  .addParam("profileId", "The profile # to check")
  .setAction(async (taskArgs, hre) => {
    const contract = await hre.run("profile:contract", { contract: taskArgs.contract });
    const profileId = taskArgs.profileId;

    const metadata = await hre.run("fetch:metadata", { contract, profileId });
    const ipfsURL = new URL(metadata.image);
    const cid = ipfsURL.host;
    const path = '/threeid.png';

    const imageURL = await hre.run("storage:url", { cid, path });

    console.log(imageURL.href);
  });

subtask("check:operator", "Check that operator address and wallet private key match")
  .setAction(async (taskArgs, hre) => {
    // Get the address of the operator wallet instance that we
    // constructed. Check that it has the expected value as contained in
    // the configuration file.
    const operatorKey = await hre.run("config:operator:privateKey");
    const operator = new hre.ethers.Wallet(operatorKey);
    const operatorAddress = await operator.getAddress();
    // Configured wallet address in config for NET_XXX.user.operator.
    const operatorWallet = await hre.run("config:account", { account: "operator" });
    if (operatorWallet !== operatorAddress) {
      throw new Error("operator wallet address doesn't match configured private key!");
    }
  });

subtask("check:owner", "Check that operator address and wallet private key match")
  .setAction(async (taskArgs, hre) => {
    // Check that the owner wallet instance has the same address that is
    // set in the configuration file for the owner alias.
    const ownerKey = await hre.run("config:owner:privateKey");
    const owner = new hre.ethers.Wallet(ownerKey);
    const ownerAddress = await owner.getAddress();
    // Configured wallet address in config for NET_XXX.user.owner.
    const ownerWallet = await hre.run("config:account", { account: "owner" });
    if (ownerWallet !== ownerAddress) {
      throw new Error("owner wallet address doesn't match configured private key!");
    }
  });

subtask("check:recovery", "Ensure recovery address matches operator wallet address")
  .addParam("messageHashBinary", "Message hash as array", [], types.any)
  .addParam("signature", "Signature computed for voucher")
  .addParam("operatorAddress", "Operator wallet address")
  .setAction(async (taskArgs, hre) => {
    const operatorAddress = taskArgs.operatorAddress;
    // https://github.com/ethers-io/ethers.js/issues/468#issuecomment-475990764
    const recoveryAddress = await hre.ethers.utils.verifyMessage(
      taskArgs.messageHashBinary,
      taskArgs.signature
    )
    if (operatorAddress !== recoveryAddress) {
      throw new Error(`These should be equal: ${operatorAddress}, ${recoveryAddress}`);
    };
  });

task("profile:deploy", "Deploy the PFP contract")
  .addOptionalParam("maxProfiles", "Maximum number of profiles to allow", 1000, types.int)
  .setAction(async (taskArgs, hre) => {
    // Pre-flight sanity checks.
    await hre.run("check:owner");
    await hre.run("check:operator");

    // Inject into contract to limit the number of profiles that can be minted.
    const maxPFPs = taskArgs.maxProfiles;

    // The voucher recipient should be the "operator" account.
    const operatorAddress = await hre.run("config:account", { account: "operator" });

    // When network is localhost, use an already baked asset for the premint.
    let publishResult;
    if (hre.network.name == 'localhost') {
      publishResult = {
        url: "ipfs://bafyreigtb2quz6kcyix5dw5cknfarhosz4t43ze4egvt2ufoybjhgy6qty/metadata.json",
      };
    } else {
      // The URL of the published asset.
      publishResult = await hre.run("profile:premint", {});
    }

    // Create and sign a voucher.
    const zeroVoucher = await hre.run("profile:sign-voucher", {
      account: operatorAddress,
      tokenUri: publishResult.url,
    });

    const Profile = await hre.ethers.getContractFactory("ThreeId_ProfilePicture");
    const profile = await Profile.deploy(operatorAddress, maxPFPs, zeroVoucher);

    await profile.deployed();

    console.log("ThreeId_ProfilePicture deployed to:", profile.address);

    // Check stored contract address, prompt user to update secret.ts if
    // not the same as the address of the contract that was just deployed.
    const contractAddress = await hre.run("profile:contract");
    if (contractAddress !== profile.address) {
      console.log(chalk.red(`Profile contract address has changed! Please update secret.ts`));
    }
  });

task("profile:destroy", "Send the selfdestruct message to a given contract")
  .addOptionalParam("contract", "The contract address")
  .addParam("account", "The account address to which we transfer contract contents (must be operator)")
  .setAction(async (taskArgs, hre) => {
    const contract = await hre.run("profile:contract", { contract: taskArgs.contract });
    const account = await hre.run("config:account", { account: taskArgs.account });
    const contractName = "ThreeId_ProfilePicture";
    const profile = await hre.ethers.getContractAt(contractName, contract);
    return profile.destructor(account);
  });

task("profile:mint", "Mint a profile for an account")
  // .addOptionalParam("contract", "The contract address")
  .addParam("account", "The recipient account address")
  .setAction(async (taskArgs, hre) => {
    // The invitation smart contract address.
    // const contract = await hre.run("invite:contract", { contract: taskArgs.contract });

    // The recipient address for the invitation.
    const account = await hre.run("config:account", { account: taskArgs.account });

    // Create the profile asset
    const profilePicturePayload = await hre.run("profile:generate-payload", {
      account,
    });

    console.log(JSON.stringify(profilePicturePayload));

    // Call our contract to award the invite.
    // const awardResult = await hre.run("call:awardProfile", {
    //   account,
    //   contract,
    //   tokenUri: publishResult.url,
    //   voucher: JSON.stringify(voucher),
    // });

    // console.log(chalk.red("AWARDED INVITE"));
    // console.log(chalk.green("-> contract:"), contract);
    // console.log(chalk.green("->  invitee:"), account);
    // console.log(chalk.green("-> metadata:"), publishResult.url);
    // console.log(chalk.green("->   invite:"), `#${inviteId}`);
    // console.log(chalk.green("->   issued:"), `${issueDate}Z`);
    // console.log(chalk.green("->     tier:"), inviteTier);
    // console.log(chalk.green("->    asset:"), outputFile);
  });

  // config
// -----------------------------------------------------------------------------

const config: HardhatUserConfig = {
  defaultNetwork: "localhost",
  solidity: "0.8.12",
  etherscan: {
    apiKey: `${ETHERSCAN.apiKey}`,
  },
  networks: {
    goerli: {
      // For optional validation.
      chainId: GOERLI_CHAIN_ID,
      url: NET_GOERLI.alchemy.appURL,
      // Account to use as the default sender. If not supplied, the
      // first account of the node is used.
      //from: "",
      accounts: [
        NET_GOERLI.wallet.ownerKey,
        NET_GOERLI.wallet.operatorKey,
      ],
    },
    rinkeby: {
      // For optional validation.
      chainId: RINKEBY_CHAIN_ID,
      url: NET_RINKEBY.alchemy.appURL,
      // Account to use as the default sender. If not supplied, the
      // first account of the node is used.
      //from: "",
      accounts: [
        NET_RINKEBY.wallet.ownerKey,
        NET_RINKEBY.wallet.operatorKey,
      ],
    },
    mumbai: {
      // For optional validation.
      chainId: MUMBAI_CHAIN_ID,
      url: NET_MUMBAI.alchemy.appURL,
      // Account to use as the default sender. If not supplied, the
      // first account of the node is used.
      //from: "",
      accounts: [
        NET_MUMBAI.wallet.ownerKey,
        NET_MUMBAI.wallet.operatorKey,
      ],
    },
    polygon: {
      // For optional validation.
      chainId: POLYGON_CHAIN_ID,
      url: NET_POLYGON.alchemy.appURL,
      // Account to use as the default sender. If not supplied, the
      // first account of the node is used.
      //from: "",
      accounts: [
        NET_POLYGON.wallet.ownerKey,
        NET_POLYGON.wallet.operatorKey,
      ],
    },
    mainnet: {
      // For optional validation.
      chainId: MAINNET_CHAIN_ID,
      url: NET_MAINNET.alchemy.appURL,
      // Account to use as the default sender. If not supplied, the
      // first account of the node is used.
      //from: "",
      accounts: [
        NET_MAINNET.wallet.ownerKey,
        NET_MAINNET.wallet.operatorKey,
      ],
    }
  },
};

export default config;
