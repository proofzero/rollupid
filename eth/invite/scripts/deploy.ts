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
  uri: 'ipfs://bafyreicm7lkbux2kmfgop4cxin4ckfg6ojtkuhnql5rksrgbdekds56k4e/metadata.json',
  tokenId: '0',
  signature: '0xba48548bba635f38a3e907e88e7c8c0470edb9d8f5836a6bc3119507dccdd044193678e07a813063ddec7be38894c566bfa32bcf529528153ffd9f7d71d1635e1c'
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
