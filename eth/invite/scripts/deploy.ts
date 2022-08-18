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
  recipient: '0x3DaC36FE079e311489c6cF5CC456a6f38FE01A52',
  uri: 'ipfs://bafyreic6i6iex32g6zpsk4njyjfmhttjxfh436apluuzs4xw6rz2oepvzq/metadata.json',
  tokenId: '1',
  messageHash: '0xc605cbdd8102e5a67198464c519b80c4b9ca2bbf0d5041f3f480fab1e799ca9a',
  signature: '0x6cebf68fea96bbf402b63c1e686798adf189cf061a8cb873b102d8a36e6d2ec4315d9e1f0ab7a66bd804d3b3be0c62e9007f843b8c41c6473aa1a3e7339233a41b'
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
