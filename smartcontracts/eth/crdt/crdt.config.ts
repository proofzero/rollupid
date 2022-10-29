// eth/crdt.config.ts

// import * as cheerio from "cheerio";
// import * as path from "path";
import chalk from "chalk";
// import fs from "fs";
// import https from "node:https";
// import { NFTStorage, File } from "nft.storage";
// import { createAlchemyWeb3 } from "@alch/alchemy-web3";
import { HardhatUserConfig } from "hardhat/types";
import { subtask, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-solhint";
import "@openzeppelin/hardhat-upgrades";

import {
  // Plugin configuration
  ETHERSCAN,

  // Network-specific configuration
  NET_LOCALHOST,
  NET_GOERLI,
  NET_MUMBAI,
  NET_POLYGON,
  NET_MAINNET,

  // Types
  ChainnetConfiguration,
} from "./crdt.networks";

// definitions
// -----------------------------------------------------------------------------

// Chain IDs are added to hardhat configuration to perform an additional
// bit of validation that you're talking to the network you think you're
// talking to.
const MAINNET_CHAIN_ID = 1;
const GOERLI_CHAIN_ID = 5;
const MUMBAI_CHAIN_ID = 80001;
const POLYGON_CHAIN_ID = 137;

// From the TypeScript built from the Solidity code.
// const CRDT_CONTRACT_NAME = "contracts/CRDT.sol:KubeltPlatformCredits";
const CRDT_CONTRACT_NAME = "KubeltPlatformCredits";
const CRDT_CONTRACT_NAME_V2 = "KubeltPlatformCreditsV2";

subtask(
  "network:config",
  "Return network-specific configuration map"
).setAction(async (taskArgs, hre) => {
  switch (hre.network.name) {
    case "localhost":
      return NET_LOCALHOST;
      break;
    case "goerli":
      return NET_GOERLI;
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

subtask("crdt:proxy", "Return contract (proxy) address for selected network")
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

task("crdt:deploy", "Deploy the Kubelt Credit proxy and contract").setAction(
  async (taskArgs, hre) => {
    const CRDT = await hre.ethers.getContractFactory(CRDT_CONTRACT_NAME);
    const crdt = await hre.upgrades.deployProxy(CRDT, [
      /* Params */
    ]);
    await crdt.deployed();

    console.log("KubeltPlatformCredits proxy deployed to:", crdt.address);

    // Check stored proxy address and prompt user to update secrets.
    const proxyAddress = await hre.run("crdt:proxy");
    if (proxyAddress !== crdt.address) {
      console.log(
        chalk.red(
          `Proxy contract address has changed! Please update PROXY_ADDRESS.`
        )
      );
    }
  }
);

task("crdt:update", "Upgrade the Kubelt Credit contract").setAction(
  async (taskArgs, hre) => {
    console.log(
      chalk.red(
        `Contracts are 'upgraded', not 'updated'. This is an alias, so let's upgrayedd...`
      )
    );
    await hre.run("crdt:upgrade", taskArgs);
  }
);

task("crdt:upgrade", "Upgrade the Kubelt Credit contract")
  .addOptionalParam("contract", "The contract (proxy) address to upgrade.")
  .setAction(async (taskArgs, hre) => {
    const contract = await hre.run("crdt:proxy", {
      contract: taskArgs.contract,
    });
    const CRDT = await hre.ethers.getContractFactory(CRDT_CONTRACT_NAME_V2);
    const crdt = await hre.upgrades.upgradeProxy(contract, CRDT);
    await crdt.deployed();

    // Check stored proxy address and prompt user to update secrets.
    // For upgrades this codepath shouldn't happen.
    const proxyAddress = await hre.run("crdt:proxy");
    if (proxyAddress !== crdt.address) {
      console.log(
        chalk.red(
          `Proxy contract address has changed! Please update PROXY_ADDRESS.`
        )
      );
    }
  });

task("crdt:message", "Get the message for testing upgrades")
  .addOptionalParam("contract", "The address of the contract (proxy).")
  .setAction(async (taskArgs, hre) => {
    const address = await hre.run("crdt:proxy", {
      contract: taskArgs.contract,
    });
    if (!address) {
      console.log(chalk.red(`Missing --contract or PROXY_ADDRESS!`));
      return;
    }

    const crdt = await hre.ethers.getContractAt(CRDT_CONTRACT_NAME, address);
    console.log(await crdt.getMessage());
  });

// config
// -----------------------------------------------------------------------------
const config: any = {
  defaultNetwork: "localhost",
  solidity: "0.8.12",
  settings: {
    optimizer: {
      enabled: true,
      runs: 1000,
    },
  },
  etherscan: {
    apiKey: `${ETHERSCAN.apiKey}`,
  },
  networks: {
    goerli: {
      chainId: GOERLI_CHAIN_ID,
      url: NET_GOERLI.alchemy.appURL,
      accounts: [
        NET_GOERLI.wallet.ownerKey,
        // NET_GOERLI.wallet.operatorKey,
      ],
    },
    mumbai: {
      chainId: MUMBAI_CHAIN_ID,
      url: NET_MUMBAI.alchemy.appURL,
      accounts: [
        NET_MUMBAI.wallet.ownerKey,
        // NET_MUMBAI.wallet.operatorKey,
      ],
    },
    polygon: {
      chainId: POLYGON_CHAIN_ID,
      url: NET_POLYGON.alchemy.appURL,
      accounts: [
        NET_POLYGON.wallet.ownerKey,
        // NET_POLYGON.wallet.operatorKey,
      ],
    },
    mainnet: {
      chainId: MAINNET_CHAIN_ID,
      url: NET_MAINNET.alchemy.appURL,
      accounts: [
        NET_MAINNET.wallet.ownerKey,
        // NET_MAINNET.wallet.operatorKey,
      ],
    },
  },
};

export default config;
