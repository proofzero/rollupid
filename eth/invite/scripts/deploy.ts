// eth/invite/scripts/deploy.ts

import { ethers } from "hardhat";

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
  recipient: '0x274a8B441c231902aED4e2Fc8BaCBcfA16724fcD',
  uri: 'ipfs://bafyreigztfdyefyjtzg4i5fg7uokrdoj4jixvqt2r6puc7jwwatqiwfjbq/metadata.json',
  tokenId: '0',
  signature: '0xffae01edf06b7448f937be16952df9fbccad3ea2db58bc739d8eaa0a8d2a4e4966a7431f791a5b9c263cf09cf894b3f94f01dded1a306d08758312b0863097c61c'
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
