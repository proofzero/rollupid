// eth/invite/scripts/deploy.ts

import { ethers } from "hardhat";

// We only permit this many invitations to be minted.
//
// NB: invitation 0 is reserved, so range of permitted invites is
// [1,MAX_INVITES].
const MAX_INVITES = 10000;

// The metadata.json URL of invitation #0000, which is reserved.
const META_URL = "ipfs://bafyreigxvmsauo3tjznuonzyupfd2j325dyshsus73uhkj2cbh726lubqq/metadata.json"

// The storage provide provides the following gateway:
// https://$CID.ipfs.nftstorage.link/metadata.json

async function main() {
  const Invite = await ethers.getContractFactory("ThreeId_Invitations");
  const invite = await Invite.deploy(MAX_INVITES, META_URL);

  await invite.deployed();

  console.log("ThreeId_Invitations deployed to:", invite.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
