// eth/invite/scripts/deploy.ts

import { ethers } from "hardhat";

// We only permit this many invitations to be minted.
//
// NB: invitation 0 is reserved, so range of permitted invites is
// [1,MAX_INVITES].
const MAX_INVITES = 10000;

// The metadata.json URL of invitation #0000, which is reserved: call invite:premint and enter here.
const META_URL = "ipfs://bafyreibtpfdfb7jnx5kmxcrzizasgcxwssk5ljeb7vpp32wyphbqwmvrbi/metadata.json"

// The chain address of the operator account for the invitation system.
const OPERATOR_ADDRESS = "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720"

// The voucher for invitation zero: call invite:sign-voucher and enter here.
const ZERO_VOUCHER = {
  recipient: '0xa0Ee7A142d267C1f36714E4a8F75612F20a79720',
  uri: 'ipfs://bafyreibtpfdfb7jnx5kmxcrzizasgcxwssk5ljeb7vpp32wyphbqwmvrbi/metadata.json',
  messageHash: '0x1a6530c79f19a77e0568d87d131dd8e5c5af867353f5dfe63e368281d6869db4',
  signature: '0x1c90b9416b37e9aeebac0494cbfdd820675e5b13a7456b93041b171b3965f6ce42b4a291410a357b0844791cbb1bfa91600996cb54a14973444e3f986177a3581c'
}

// The storage provide provides the following gateway:
// https://$CID.ipfs.nftstorage.link/metadata.json

async function main() {
  const Invite = await ethers.getContractFactory("ThreeId_Invitations");
  const invite = await Invite.deploy(OPERATOR_ADDRESS, MAX_INVITES, META_URL, ZERO_VOUCHER);

  await invite.deployed();

  console.log("ThreeId_Invitations deployed to:", invite.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
