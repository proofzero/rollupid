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
  messageHash: '0x3dce924c5cd6068392d58730858863fe5cdf7a5f5b47971f4f09798d506ef53e',
  signature: '0x45a5014865d4b985ea5e55f95d5bcd19b596346e6c95dc502eddc345f07ee42643440945b3b6abfcc390687235a4bd493e7122a506bca36fe6a6473fee3603561c'
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
