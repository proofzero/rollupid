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
  recipient: '0x274a8B441c231902aED4e2Fc8BaCBcfA16724fcD',
  uri: 'ipfs://bafyreicxylzvdmwbwpjk3qmk4rwbbpslzvcsyjttgetw7er2yhfpnajwq4/metadata.json',
  tokenId: '0',
  signature: '0x19da142c79270cab7c983a45a567c833c18213bbee225f9a8204915ed5441ad77f402b69c701170d7cec3bfb04f13696ed910474289a692ed577c6c3202fa3861c'
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
