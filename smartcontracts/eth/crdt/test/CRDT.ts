import { expect } from "chai";
// import { ethers } from "hardhat";

describe("CRDT Tests", function () {

  it("Should set the environment", async function () {
    expect(process.env.ETHERSCAN_API_KEY).to.not.equal(undefined);
    expect(typeof process.env.ETHERSCAN_API_KEY).to.equal('string');
    // console.log(process.env.ETHERSCAN_API_KEY);

    expect(process.env.GOERLI_OWNER_PRIVATE).to.not.equal(undefined);
    expect(typeof process.env.GOERLI_OWNER_PRIVATE).to.equal('string');
    // console.log(process.env.GOERLI_OWNER_PRIVATE);

    expect(process.env.GOERLI_OWNER_ADDRESS).to.not.equal(undefined);
    expect(typeof process.env.GOERLI_OWNER_ADDRESS).to.equal('string');
    // console.log(process.env.GOERLI_OWNER_ADDRESS);

    expect(process.env.GOERLI_ALCHEMY_URL).to.not.equal(undefined);
    expect(typeof process.env.GOERLI_ALCHEMY_URL).to.equal('string');
    // console.log(process.env.GOERLI_ALCHEMY_URL);

    expect(process.env.MUMBAI_ALCHEMY_URL).to.not.equal(undefined);
    expect(typeof process.env.MUMBAI_ALCHEMY_URL).to.equal('string');
    // console.log(process.env.MUMBAI_ALCHEMY_URL);

    expect(process.env.POLYGON_ALCHEMY_URL).to.not.equal(undefined);
    expect(typeof process.env.POLYGON_ALCHEMY_URL).to.equal('string');
    // console.log(process.env.POLYGON_ALCHEMY_URL);

    expect(process.env.ETHEREUM_ALCHEMY_URL).to.not.equal(undefined);
    expect(typeof process.env.ETHEREUM_ALCHEMY_URL).to.equal('string');
    // console.log(process.env.ETHEREUM_ALCHEMY_URL);
  });

});
