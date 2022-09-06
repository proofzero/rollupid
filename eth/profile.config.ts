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
      return config.profile_contract;
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

subtask("config:alchemyURL", "Return alchemy invite application URL")
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
  .addParam("contract", "The address of the invite contract")
  .setAction(async (taskArgs, hre) => {
    const contract = taskArgs.contract;
    const profile = await hre.ethers.getContractAt('ThreeId_ProfilePicture', contract);
    return profile.maxProfiles();
  });

subtask("call:ownerOf", 'Return result of ownerOf(tokenId) on the given contract')
  .addParam("contract", "The address of the contract")
  .addParam("inviteId", "The invitation number")
  .setAction(async (taskArgs, hre) => {
    const contract = taskArgs.contract;
    const contractName = "ThreeId_ProfilePicture";
    const inviteId = taskArgs.inviteId;
    const invite = await hre.ethers.getContractAt(contractName, contract);
    return invite.ownerOf(inviteId);
  });

subtask("call:tokenURI", 'Return result of tokenURI(tokenId) on the given contract')
  .addParam("contract", "The address of the contract")
  .addParam("inviteId", "The invitation number")
  .setAction(async (taskArgs, hre) => {
    const contract = taskArgs.contract;
    const contractName = "ThreeId_ProfilePicture";
    const inviteId = taskArgs.inviteId;
    const invite = await hre.ethers.getContractAt(contractName, contract);
    return invite.tokenURI(inviteId);
  });

subtask("call:nextProfile", "Return the ID of next profile")
  .addParam("contract", "The address of the invite contract")
  .setAction(async (taskArgs, hre) => {
    const contract = taskArgs.contract;
    const contractName = "ThreeId_ProfilePicture";
    const profile = await hre.ethers.getContractAt(contractName, contract);
    return profile.nextPFP();
  });

subtask("call:awardInvite", "Mint invitation NFT")
  .addParam("account", "The address of the invitee")
  .addParam("contract", "The invite smart contract address")
  .addParam("tokenUri", "The URI to set for the invitation")
  .addParam("voucher", "The signed voucher")
  .setAction(async (taskArgs, hre) => {
    const account = await hre.run("config:account", { account: taskArgs.account });
    const contract = taskArgs.contract;
    const tokenURI = taskArgs.tokenUri;
    // HAXX
    const voucher = JSON.parse(taskArgs.voucher);

    const contractName = "ThreeId_Invitations";

    const invite = await hre.ethers.getContractAt(contractName, contract);
    return invite.awardInvite(account, voucher);
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

subtask("fetch:metadata", "Display the metadata for the invite")
  .addParam("contract", "The invite contract address")
  .addParam("invite", "The invitation # to check")
  .setAction(async (taskArgs, hre) => {
    const contract = taskArgs.contract;
    const inviteId = taskArgs.invite;
    const uri = await hre.run("call:tokenURI", { contract, inviteId });

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

task("profile:generate-payload", "Call NFTar to get the custom NFT asset and voucher")
  .setAction(async (taskArgs, hre) => {
    return hre.run("config:nftar").then(async (config) => {
      return new Promise((resolve, reject) => {
        https.request(['https:/', config.host, 'api'].join('/'), {
          method: "POST",
          headers: {
            'authorization': 'bearer ' + config.token
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
      });
    });
  });

// subtask("invite:generate-nft-asset", "Generate custom NFT image asset")
//   .addParam("inviteId", "The invite identifier (0-padded, 4 digits)")
//   .addParam("issueDate", "Date of issue for the token")
//   .addParam("assetFile", "Path to SVG asset template")
//   .addParam("outputFile", "Path to the output SVG asset file")
//   .setAction(async (taskArgs, hre) => {
//     const inviteId = taskArgs.inviteId;
//     const issueDate = taskArgs.issueDate;
//     const assetFile = taskArgs.assetFile;
//     const outputFile = taskArgs.outputFile;

//     return fs.promises.readFile(assetFile, 'utf8')
//       .then(data => {
//         // Parse the SVG XML data and return a query context.
//         return cheerio.load(data, {
//           xml: {},
//         });
//       })
//       .then(($) => {
//         /*
//         <svg>
//           ...
//           <text id="ISSUED">04/20/2022</text>
//           <text id="NUMBER">#6969</text>
//         </svg>
//         */
//         // Set the issue date.
//         $('#ISSUED').text(issueDate);
//         // Set the invite identifier.
//         $('#NUMBER').text(`#${inviteId}`);

//         const svgText = $.root().html();
//         if (null === svgText) {
//           throw "empty SVG document generated";
//         }
//         return svgText.trim();
//       })
//       .then(svgText => {
//         return fs.promises.writeFile(outputFile, svgText);
//       })
//   });

// subtask("invite:publish-nft-storage", "Publish invite asset to nft.storage")
//   .addParam("inviteId", "The invite identifier (0-padded, 4 digits)")
//   .addParam("inviteTier", "The name of the invitation issue")
//   .addParam("issueDate", "The token issue data (UTC)")
//   .addParam("outputFile", "Path to generated image asset", "", types.inputFile)
//   .addParam("storageKey", "The API key for nft.storage")
//   .setAction(async (taskArgs, hre) => {
//     const inviteId = taskArgs.inviteId;
//     const inviteTier = taskArgs.inviteTier;
//     const issueDate = taskArgs.issueDate;
//     const outputFile = taskArgs.outputFile;
//     const storageKey = taskArgs.storageKey;
//     const baseName = path.basename(outputFile);

//     const client = new NFTStorage({
//       token: storageKey,
//     });

//     // Utility to title-case a string.
//     const titleCase = (s: String) => {
//       return s.charAt(0).toUpperCase() + s.slice(1);
//     };

//     const metadata = {
//       name: `3ID Invite #${inviteId}`,
//       description: `${titleCase(inviteTier)} 3ID Invite`,
//       image: new File(
//         [await fs.promises.readFile(outputFile)],
//         baseName,
//         { type: 'image/svg+xml' },
//       ),
//       properties: {
//         inviteId,
//         inviteTier,
//         issueDate,
//       }
//     }

//     const result = await client.store(metadata);

//     return {
//       // IPFS URL of the metadata
//       url: result.url,
//       // The metadata.json contents
//       metadata: result.data,
//       // metadata.json contents with IPFS gateway URLs
//       embed: result.embed(),
//     };
//   });

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
  .addOptionalParam("contract", "The invite contract address")
  .setAction(async (taskArgs, hre) => {
    const contract = await hre.run("profile:contract", { contract: taskArgs.contract });
    const maxPFPs = await hre.run("call:maxPFPs", { contract });

    console.log(`> maximum ${maxPFPs} profiles`);
  });

task("profile:next", "Return ID of next profile that will be awarded")
  .addOptionalParam("contract", "The invite contract address")
  .setAction(async (taskArgs, hre) => {
    const contract = await hre.run("profile:contract", { contract: taskArgs.contract });
    const nextProfile = await hre.run("call:nextProfile", { contract });

    console.log(`> next profile is #${nextProfile.toString().padStart(4, "0")}`);
  });

// task("invite:owner", "Return owner of an invite")
//   .addOptionalParam("contract", "The invite contract address")
//   .addParam("invite", "The invitation # to check")
//   .setAction(async (taskArgs, hre) => {
//     const contract = await hre.run("invite:contract", { contract: taskArgs.contract });
//     const inviteId = taskArgs.invite;

//     const owner = await hre.run("call:ownerOf", { contract, inviteId });

//     console.log(chalk.red("OWNER"));
//     console.log(chalk.green("-> contract:"), contract);
//     console.log(chalk.green("->   invite:"), `#${inviteId.toString().padStart(4, "0")}`);
//     console.log(chalk.green("->    owner:"), owner);
//   });

// task("invite:metadata", "Display the metadata for an invitation")
//   .addOptionalParam("contract", "The invite contract address")
//   .addParam("invite", "The invitation # to check")
//   .setAction(async (taskArgs, hre) => {
//     const contract = await hre.run("invite:contract", { contract: taskArgs.contract });
//     const invite = taskArgs.invite;

//     const metadata = await hre.run("fetch:metadata", { contract, invite });
//     console.log(metadata);
//   });

// task("invite:image", "Print the image URL for an invitation")
//   .addOptionalParam("contract", "The invite contract address")
//   .addParam("invite", "The invitation # to check")
//   .setAction(async (taskArgs, hre) => {
//     const contract = await hre.run("invite:contract", { contract: taskArgs.contract });
//     const invite = taskArgs.invite;

//     const metadata = await hre.run("fetch:metadata", { contract, invite });
//     const ipfsURL = new URL(metadata.image);
//     const cid = ipfsURL.host;
//     const path = `/invite-${metadata.properties.inviteId}.svg`;

//     const imageURL = await hre.run("storage:url", { cid, path });

//     console.log(imageURL.href);
//   });

// task("invite:premint", "Store the reserved invitation (#0000) asset")
//   .addParam("assetFile", "Path to SVG membership card template", "./assets/3ID_NFT_CARD_NO_BG.svg", types.inputFile)
//   .addParam("outputDir", "Location of generated asset files", OUTPUT_DIR)
//   .addOptionalParam("inviteId", "Invitation ID for the reserved preminted invite", "0000")
//   .setAction(async (taskArgs, hre) => {
//     // Location of generated asset files.
//     const outputDir = taskArgs.outputDir;

//     // Get the API key for nft.storage.
//     const storageKey = await hre.run("config:storageKey");

//     // Ensure output directory exists.
//     await fs.promises.mkdir(OUTPUT_DIR, { recursive: true });

//     // This is written into the NFT metadata and indicates which batch
//     // of invitations we're minting.
//     const inviteTier = INVITE_TIER;

//     // Returns ms since epoch if valid date string, or NaN if invalid
//     // date string. We format it as an ISO 8601 date string in UTC.
//     const issueDateParsed = Date.now();
//     const issueDate = new Intl.DateTimeFormat('utc').format(issueDateParsed);

//     const inviteId = taskArgs.inviteId;

//     // When parameter type is types.inputFile the existence of file is
//     // validated already.
//     const assetFile = taskArgs.assetFile;

//     // Path the output SVG file that we will generate from the template.
//     const outputFile = path.join("outputs", `invite-${inviteId}.svg`);

//     // Write an SVG asset file as outputFile.
//     const generateResult = await hre.run("invite:generate-nft-asset", {
//       inviteId,
//       issueDate,
//       assetFile,
//       outputFile
//     });
//     // Publish the generated asset to our storage provider.
//     const publishResult = await hre.run("invite:publish-nft-storage", {
//       storageKey,
//       inviteId,
//       inviteTier,
//       issueDate,
//       outputFile,
//     });

//     // The output URL should be entered into deploy.ts script for
//     // injection into the contract when it is deployed.
//     //console.log(publishResult.url);

//     return publishResult;
//   });

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

task("profile:sign-voucher", "Sign an profile voucher")
  .addParam("account", "The account address")
  // .addParam("profile", "The profile number to award")
  .setAction(async (taskArgs, hre) => {
    // This lets us use an account alias from secret.ts to sign a voucher.
    const recipient = await hre.run("config:account", { account: taskArgs.account });
    const uri = taskArgs.tokenUri;

    // TODO: const domain = await owner.domain owner._signingDomain()

    // 66 bytes of abi.encodePacked keccak256.
    // See https://ethereum.stackexchange.com/questions/111549/cant-validate-authenticated-message-with-ethers-js
    // See also https://github.com/ethers-io/ethers.js/issues/468#issuecomment-475895074
    const message = hre.ethers.utils.solidityKeccak256(
      [ "address", "string" ],
      [ recipient, uri ]
    );
    // console.log('message: ' + message)
    // console.log('message: ' + message.length)

    // 32 bytes of data in Uint8Array
    const messageHashBinary = hre.ethers.utils.arrayify(message);
    // console.log('messageHashBinary.length: ' + messageHashBinary.length)

    // From Ethers docs:
    // NB: A signed message is prefixed with "\x19Ethereum Signed
    // Message:\n" and the length of the message, using the hashMessage
    // method, so that it is EIP-191 compliant. If recovering the
    // address in Solidity, this prefix will be required to create a
    // matching hash.

    // Sign 32 byte digest, with the above prefix.
    const operatorKey = await hre.run("config:operator:privateKey");
    const operator = new hre.ethers.Wallet(operatorKey);
    const signature = await operator.signMessage(messageHashBinary);

    // Construct the voucher.
    const voucher = {
      recipient,
      uri,
      // messageHash: message,
      signature
    };

    // Sanity check the recovery address matches operator address.
    await hre.run("check:recovery", {
      messageHashBinary,
      signature,
      operatorAddress: operator.address
    });

    console.log('signed voucher: ', voucher);

    return voucher
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

    console.log("ThreeId_Invitations deployed to:", profile.address);

    // Check stored contract address, prompt user to update secret.ts if
    // not the same as the address of the contract that was just deployed.
    const contractAddress = await hre.run("profile:contract");
    if (contractAddress !== profile.address) {
      console.log(chalk.red(`Profile contract address has changed! Please update secret.ts`));
    }
  });

// task("invite:destroy", "Send the selfdestruct message to a given contract")
//   .addOptionalParam("contract", "The invite contract address")
//   .addParam("account", "The account address to which we transfer contract contents (must be operator)")
//   .setAction(async (taskArgs, hre) => {
//     const contract = await hre.run("invite:contract", { contract: taskArgs.contract });
//     const account = await hre.run("config:account", { account: taskArgs.account });
//     const contractName = "ThreeId_Invitations";
//     const invite = await hre.ethers.getContractAt(contractName, contract);
//     return invite.destructor(account);
//   })

// task("invite:award", "Mint an invite for an account")
//   .addOptionalParam("contract", "The invite contract address")
//   .addParam("account", "The account address")
//   .addParam("assetFile", "Path to SVG membership card template", "./assets/3ID_NFT_CARD_NO_BG.svg", types.inputFile)
//   .addParam("outputDir", "Location of generated asset files", OUTPUT_DIR)
//   .setAction(async (taskArgs, hre) => {
//     // The invitation smart contract address.
//     const contract = await hre.run("invite:contract", { contract: taskArgs.contract });
//     // The recipient address for the invitation.
//     const account = await hre.run("config:account", { account: taskArgs.account });
//     // Location of generated asset files.
//     const outputDir = taskArgs.outputDir;

//     // Get the API key for nft.storage.
//     const storageKey = await hre.run("config:storageKey");

//     // Ensure output directory exists.
//     await fs.promises.mkdir(OUTPUT_DIR, { recursive: true });

//     // This is written into the NFT metadata and indicates which batch
//     // of invitations we're minting.
//     const inviteTier = INVITE_TIER;

//     // Returns ms since epoch if valid date string, or NaN if invalid
//     // date string. We format it as an ISO 8601 date string in UTC.
//     const issueDateParsed = Date.now();
//     const issueDate = new Intl.DateTimeFormat('utc').format(issueDateParsed);

//     // Get the tokenId of the next invitation.
//     // **WARNING** potential race condition here!
//     const nextInvite = await hre.run("call:nextInvite", { contract });
//     // Token identifiers are integers in the range [0,1000). Convert to
//     // a zero-padded 4-digit string.
//     const inviteId = nextInvite.toString().padStart(4, "0");

//     // When parameter type is types.inputFile the existence of file is
//     // validated already.
//     const assetFile = taskArgs.assetFile;

//     // Path the output SVG file that we will generate from the template.
//     const outputFile = path.join("outputs", `invite-${inviteId}.svg`);

//     // Write an SVG asset file as outputFile.
//     const generateResult = await hre.run("invite:generate-nft-asset", {
//       inviteId,
//       issueDate,
//       assetFile,
//       outputFile
//     });

//     // Publish the generated asset to our storage provider.
//     const publishResult = await hre.run("invite:publish-nft-storage", {
//       storageKey,
//       inviteId,
//       inviteTier,
//       issueDate,
//       outputFile,
//     });

//     // Create and sign a voucher
//     const voucher = await hre.run("invite:sign-voucher", {
//       account,
//       tokenUri: publishResult.url,
//       invite: inviteId,
//     });

//     // Call our contract to award the invite.
//     const awardResult = await hre.run("call:awardInvite", {
//       account,
//       contract,
//       tokenUri: publishResult.url,
//       voucher: JSON.stringify(voucher),
//     });

//     console.log(chalk.red("AWARDED INVITE"));
//     console.log(chalk.green("-> contract:"), contract);
//     console.log(chalk.green("->  invitee:"), account);
//     console.log(chalk.green("-> metadata:"), publishResult.url);
//     console.log(chalk.green("->   invite:"), `#${inviteId}`);
//     console.log(chalk.green("->   issued:"), `${issueDate}Z`);
//     console.log(chalk.green("->     tier:"), inviteTier);
//     console.log(chalk.green("->    asset:"), outputFile);
//   });

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
