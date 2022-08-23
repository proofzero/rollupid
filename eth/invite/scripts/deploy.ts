// eth/invite/scripts/deploy.ts

import { ethers } from "hardhat";
import { NET_MAINNET, NET_GOERLI, NET_LOCALHOST } from "../../secret";

// We only permit this many invitations to be minted.
//
// NB: invitation 0 is reserved, so range of permitted invites is
// [1,MAX_INVITES].
const MAX_INVITES = 10000;

// The metadata.json URL of invitation #0000, which is reserved: call invite:premint and enter here.
//const META_URL = "ipfs://bafyreibtpfdfb7jnx5kmxcrzizasgcxwssk5ljeb7vpp32wyphbqwmvrbi/metadata.json"

// TODO: MAKE THE ZERO VOUCHER PER-NET. CURRENT: RINKEBY
// The voucher for invitation zero: call invite:sign-voucher and enter here.
const ZERO_VOUCHER = {
  recipient: '0xAb79A45B653091633BB6D0930fc2e21B17B1D255',
  uri: 'ipfs://bafyreichcklmhlx5txmrgpmj3irgegnyemsvlqre7hexrjay44hwotj5mu/metadata.json',
  tokenId: '0',
  signature: '0x9462c9a11cd1db11279213b7eb99ee63ecd2ae144a16ecb4d40a2a466e1f813d753674d1db68403ff22014b9a2a653558ac0a024e4b231e1ca394306e9ce45591b'
}

// The storage provide provides the following gateway:
// https://$CID.ipfs.nftstorage.link/metadata.json

async function main() {
  // TODO inspect hre to determine current network and use corresponding configuration object.

  // The chain address of the operator account for the invitation system.
  const operatorKey = NET_MAINNET.wallet.operatorKey;
  const operator = new ethers.Wallet(operatorKey);
  const OPERATOR_ADDRESS = await operator.getAddress();

  const OWNER_ADDRESS = NET_MAINNET.wallet.ownerKey;

  console.log(`deploying with owner address: ${OWNER_ADDRESS}`);
  console.log(`deploying with operator address: ${OPERATOR_ADDRESS}`);

  const Invite = await ethers.getContractFactory("ThreeId_Invitations");
  const invite = await Invite.deploy(OPERATOR_ADDRESS, MAX_INVITES, ZERO_VOUCHER);

  await invite.deployed();

  console.log("ThreeId_Invitations deployed to:", invite.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
