import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { expect } from "chai";
import { ethers } from "hardhat";

describe("Profile Pictures", function () {

  // Make signed voucher fixtures.
  async function signVoucher(_recipient: SignerWithAddress, _uri: string, operator: SignerWithAddress) {
    const voucher = {
      recipient: _recipient.address,
      uri: _uri,
      signature: '',
    };

    const message = ethers.utils.solidityKeccak256(
      [ "address", "string" ],
      [ voucher.recipient, voucher.uri ]
    );
    const messageHashBinary = ethers.utils.arrayify(message);
    voucher.signature = await operator.signMessage(messageHashBinary);

    return voucher;
  }

  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshopt in every test.
  async function deployPFPFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, operator] = await ethers.getSigners();

    const voucher = await signVoucher(operator, 'https://example.com', operator);

    const Profile = await ethers.getContractFactory("ThreeId_ProfilePicture");
    const pfp = await Profile.deploy(operator.address);

    return { pfp, voucher, owner, operator };
  }

  describe("Deployment", function () {
    it("Should set the right next token id", async function () {
      const { pfp } = await loadFixture(deployPFPFixture);
      expect(await pfp.nextPFP()).to.equal(0);
    });
  });

  describe("Signatures", function () {
    it("Should validate operator signatures", async function () {
      const { pfp, voucher, owner, operator } = await loadFixture(deployPFPFixture);
      expect(await pfp._recoverVoucherSigner(voucher)).to.equal(operator.address);
    });
  });

  describe("Profiles", function () {
    it("Should reject bad vouchers", async function () {
      const { pfp, voucher, owner, operator } = await loadFixture(deployPFPFixture);
      const nextVoucher = await signVoucher(owner, 'https://example.com', owner);
      await expect(pfp.awardPFP(owner.address, nextVoucher)).to.be.rejected;
    });

    it("Should reject bad recipients", async function () {
      const { pfp, voucher, owner, operator } = await loadFixture(deployPFPFixture);
      const nextVoucher = await signVoucher(owner, 'https://example.com', operator);
      await expect(pfp.awardPFP(operator.address, nextVoucher)).to.be.rejected;
    });

    it("Should work", async function () {
      const { pfp, voucher, owner, operator } = await loadFixture(deployPFPFixture);
      const nextVoucher = await signVoucher(owner, 'https://example.com', operator);
      await expect(pfp.awardPFP(owner.address, nextVoucher)).not.to.be.rejected;
    });
  });

  describe("Destruction", function () {
    it("Should reject non-operator destruction requests", async function () {
      const { pfp, voucher, owner, operator } = await loadFixture(deployPFPFixture);
      await expect(pfp.destructor(owner.address)).to.be.rejected;
    });

    it("Should accept operator destruction requests", async function () {
      const { pfp, voucher, owner, operator } = await loadFixture(deployPFPFixture);
      await expect(pfp.destructor(operator.address)).not.to.be.rejected;
    });
  });

});