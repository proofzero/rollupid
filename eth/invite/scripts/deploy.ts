// eth/invite/scripts/deploy.ts

import { ethers } from "hardhat";

// We only permit this many invitations to be minted.
//
// NB: invitation 0 is reserved, so range of permitted invites is
// [1,MAX_INVITES].
const MAX_INVITES = 10000;

// The metadata.json URL of invitation #0000, which is reserved: call invite:premint and enter here.
//const META_URL = "ipfs://bafyreibtpfdfb7jnx5kmxcrzizasgcxwssk5ljeb7vpp32wyphbqwmvrbi/metadata.json"

// The chain address of the operator account for the invitation system.
const OPERATOR_ADDRESS = "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720"

// The voucher for invitation zero: call invite:sign-voucher and enter here.
const ZERO_VOUCHER = {
  recipient: '0x3DaC36FE079e311489c6cF5CC456a6f38FE01A52',
  uri: 'ipfs://bafyreic6i6iex32g6zpsk4njyjfmhttjxfh436apluuzs4xw6rz2oepvzq/metadata.json',
  tokenId: '1',
  signature: '0x34db134dc0147df7e67ecc6a70e4e886b2984a869436b2f04fef5903a6a961481f3af5ab3d1efe865d1edc52ba7b8aa46def71bc8f2d7e5a7f57c5207141587d1c'
}

// The storage provide provides the following gateway:
// https://$CID.ipfs.nftstorage.link/metadata.json

async function main() {
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
