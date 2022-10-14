import { expect } from "chai";
// import { ethers } from "hardhat";

describe("CRDT Tests", function () {

  it("Should set the environment", async function () {
    expect(process.env.CRDT_ETHERSCAN_API_KEY).to.not.equal(undefined);
    expect(typeof process.env.CRDT_ETHERSCAN_API_KEY).to.equal('string');
    // console.log(process.env.CRDT_ETHERSCAN_API_KEY);

    expect(process.env.CRDT_GOERLI_OWNER_PRIVATE).to.not.equal(undefined);
    expect(typeof process.env.CRDT_GOERLI_OWNER_PRIVATE).to.equal('string');
    // console.log(process.env.CRDT_GOERLI_OWNER_PRIVATE);

    expect(process.env.CRDT_GOERLI_OWNER_ADDRESS).to.not.equal(undefined);
    expect(typeof process.env.CRDT_GOERLI_OWNER_ADDRESS).to.equal('string');
    // console.log(process.env.CRDT_GOERLI_OWNER_ADDRESS);

    expect(process.env.CRDT_GOERLI_ALCHEMY_URL).to.not.equal(undefined);
    expect(typeof process.env.CRDT_GOERLI_ALCHEMY_URL).to.equal('string');
    // console.log(process.env.CRDT_GOERLI_ALCHEMY_URL);

    expect(process.env.CRDT_MUMBAI_ALCHEMY_URL).to.not.equal(undefined);
    expect(typeof process.env.CRDT_MUMBAI_ALCHEMY_URL).to.equal('string');
    // console.log(process.env.CRDT_MUMBAI_ALCHEMY_URL);

    expect(process.env.CRDT_POLYGON_ALCHEMY_URL).to.not.equal(undefined);
    expect(typeof process.env.CRDT_POLYGON_ALCHEMY_URL).to.equal('string');
    // console.log(process.env.CRDT_POLYGON_ALCHEMY_URL);

    expect(process.env.CRDT_ETHEREUM_ALCHEMY_URL).to.not.equal(undefined);
    expect(typeof process.env.CRDT_ETHEREUM_ALCHEMY_URL).to.equal('string');
    // console.log(process.env.CRDT_ETHEREUM_ALCHEMY_URL);
  });

});
