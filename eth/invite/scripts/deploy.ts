// eth/invite/scripts/deploy.ts

import { ethers } from "hardhat";

// We only permit this many invitations to be minted.
//
// NB: invitation 0 is reserved, so range of permitted invites is
// [1,MAX_INVITES].
const MAX_INVITES = 10000;

// The metadata.json URL of invitation #0000, which is reserved: call invite:premint and enter here.
//const META_URL = "ipfs://bafyreibtpfdfb7jnx5kmxcrzizasgcxwssk5ljeb7vpp32wyphbqwmvrbi/metadata.json"

// The voucher for invitation zero: call invite:sign-voucher and enter here.
const ZERO_VOUCHER = {
  recipient: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  uri: 'ipfs://bafyreic6i6iex32g6zpsk4njyjfmhttjxfh436apluuzs4xw6rz2oepvzq/metadata.json',
  tokenId: '0',
  signature: '0xeab3db9d19dc3361bde9ec7dab75ecd2c6b7041dbd1ac999e1c675051720431b40651cb004bc80f96e7ffdf51b98366d40ff13bad0ba8a8a15b7655eefdb17e01c'
};

// The storage provide provides the following gateway:
// https://$CID.ipfs.nftstorage.link/metadata.json

async function main() {
  // The chain address of the operator account for the invitation system.
  const [_, operator] = await ethers.getSigners();
  const OPERATOR_ADDRESS = operator.address;

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
