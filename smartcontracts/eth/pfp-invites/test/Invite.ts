import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { ethers } from "hardhat";

chai.use(chaiAsPromised);
const expect = chai.expect;

describe("Invitations", function () {
  const maxInvites = 10;

  // Make signed voucher fixtures.
  async function signVoucher(
    _recipient: SignerWithAddress,
    _uri: string,
    _tokenId: number,
    operator: SignerWithAddress
  ) {
    const voucher = {
      recipient: _recipient.address,
      uri: _uri,
      tokenId: _tokenId,
      signature: "",
    };

    const message = ethers.utils.solidityKeccak256(
      ["address", "string", "uint"],
      [voucher.recipient, voucher.uri, voucher.tokenId]
    );
    const messageHashBinary = ethers.utils.arrayify(message);
    voucher.signature = await operator.signMessage(messageHashBinary);

    return voucher;
  }

  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshopt in every test.
  async function deployInviteFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, operator] = await ethers.getSigners();

    const voucher = await signVoucher(
      operator,
      "https://example.com",
      0,
      operator
    );

    const Invite = await ethers.getContractFactory("ThreeId_Invitations");
    const invite = await Invite.deploy(operator.address, maxInvites, voucher);

    return { invite, voucher, owner, operator };
  }

  describe("Deployment", function () {
    it("Should set the right maximum", async function () {
      const { invite } = await loadFixture(deployInviteFixture);
      expect(await invite.maxInvitations()).to.equal(maxInvites);
    });

    it("Should set the right next token id", async function () {
      const { invite } = await loadFixture(deployInviteFixture);
      expect(await invite.nextInvite()).to.equal(1);
    });
  });

  describe("Signatures", function () {
    it("Should validate operator signatures", async function () {
      const { invite, voucher, owner, operator } = await loadFixture(
        deployInviteFixture
      );
      expect(await invite._recoverVoucherSigner(voucher)).to.equal(
        operator.address
      );
    });
  });

  describe("Invites", function () {
    it("Should reject out-of-order invites", async function () {
      const { invite, voucher, owner, operator } = await loadFixture(
        deployInviteFixture
      );
      const nextVoucher = await signVoucher(
        owner,
        "https://example.com",
        5,
        operator
      );
      await expect(invite.awardInvite(owner.address, nextVoucher)).to.be
        .rejected;
    });

    it("Should reject bad vouchers", async function () {
      const { invite, voucher, owner, operator } = await loadFixture(
        deployInviteFixture
      );
      const nextVoucher = await signVoucher(
        owner,
        "https://example.com",
        5,
        owner
      );
      await expect(invite.awardInvite(owner.address, nextVoucher)).to.be
        .rejected;
    });

    it("Should reject bad recipients", async function () {
      const { invite, voucher, owner, operator } = await loadFixture(
        deployInviteFixture
      );
      const nextVoucher = await signVoucher(
        owner,
        "https://example.com",
        1,
        operator
      );
      await expect(invite.awardInvite(operator.address, nextVoucher)).to.be
        .rejected;
    });

    it("Should work", async function () {
      const { invite, voucher, owner, operator } = await loadFixture(
        deployInviteFixture
      );
      const nextVoucher = await signVoucher(
        owner,
        "https://example.com",
        1,
        operator
      );
      await expect(invite.awardInvite(owner.address, nextVoucher)).not.to.be
        .rejected;
    });

    it("Shouldn't assign more than max invites", async function () {
      const { invite, voucher, owner, operator } = await loadFixture(
        deployInviteFixture
      );
      for (let i = 1; i <= maxInvites; i++) {
        const nextVoucher = await signVoucher(
          owner,
          "https://example.com",
          i,
          operator
        );
        await expect(invite.awardInvite(owner.address, nextVoucher)).not.to.be
          .rejected;
      }
      const nextVoucher = await signVoucher(
        owner,
        "https://example.com",
        maxInvites + 1,
        operator
      );
      await expect(invite.awardInvite(owner.address, nextVoucher)).to.be
        .rejected;
    });
  });

  describe("Destruction", function () {
    it("Should reject non-operator destruction requests", async function () {
      const { invite, voucher, owner, operator } = await loadFixture(
        deployInviteFixture
      );
      await expect(invite.destructor(owner.address)).to.be.rejected;
    });

    it("Should accept operator destruction requests", async function () {
      const { invite, voucher, owner, operator } = await loadFixture(
        deployInviteFixture
      );
      await expect(invite.destructor(operator.address)).not.to.be.rejected;
    });
  });
});
