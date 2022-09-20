const utils = require('../src/utils.js');

describe('Utilities', () => {
  test('calculateNFTWeight null test', () => {
    const nfts = new Map();
    const result = utils.calculateNFTWeight(nfts);
    expect(result).toStrictEqual({"COMMON": 0, "EPIC": 0, "RARE": 0, "UNCOMMON": 0});
  });

  test('calculateNFTWeight BAYC test', () => {
    const nfts = new Map();
    nfts.set(0, {
      contract: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
      name: "Bored Ape Yacht Club",
      kind: "EPIC",
      value: 2,
    });
    const result = utils.calculateNFTWeight(nfts);
    expect(result).toStrictEqual({"COMMON": 0, "EPIC": 2, "RARE": 0, "UNCOMMON": 0});
  });

  test('calculateSpecialWeight null test', () => {
    const nfts = new Map();
    const result = utils.calculateSpecialWeight(nfts);
    expect(result).toStrictEqual({"COMMON": 0, "EPIC": 0, "RARE": 0, "UNCOMMON": 0});
  });

  test('calculateSpecialWeight invite test', () => {
    const nfts = new Map();
    nfts.set(0, {
      contract: "0x92cE069c08e39bcA867d45d2Bdc4eBE94e28321a",
      name: "3ID Invite",
      kind: "EPIC",
      value: 2,
    });
    const result = utils.calculateSpecialWeight(nfts);
    expect(result).toStrictEqual({"COMMON": 0, "EPIC": 2, "RARE": 0, "UNCOMMON": 0});
  });

  test('calculateBalanceWeight full test', () => {
    const nfts = new Map();
    nfts.set(0, {
      contract: "0x92cE069c08e39bcA867d45d2Bdc4eBE94e28321a",
      name: "3ID Invite",
      kind: "EPIC",
      value: 2,
    });
    expect(utils.calculateBalanceWeight(0)).toStrictEqual({"COMMON": 0, "EPIC": 0, "RARE": 0, "UNCOMMON": 0});
    expect(utils.calculateBalanceWeight(2)).toStrictEqual({"COMMON": 0, "EPIC": 0, "RARE": 0, "UNCOMMON": 1});
    expect(utils.calculateBalanceWeight(11)).toStrictEqual({"COMMON": 0, "EPIC": 0, "RARE": 1, "UNCOMMON": 1});
    expect(utils.calculateBalanceWeight(101)).toStrictEqual({"COMMON": 0, "EPIC": 1, "RARE": 1, "UNCOMMON": 1});
  });

  test('EPIC traits do not underflow', () => {
    expect(() => {
      // We take out all of the weights, leaving only EPIC: 2. We then draw
      // three traits, which would underflow the list of two EPIC traits
      // without the new _default parameter.
      utils.generateTraits({
        trait1: {
          COMMON: -100,
          UNCOMMON: -50,
          RARE: -25,
          EPIC: 0,
        },
        trait2: {
          COMMON: -100,
          UNCOMMON: -50,
          RARE: -25,
          EPIC: 0,
        },
        trait3: {
          COMMON: -100,
          UNCOMMON: -50,
          RARE: -25,
          EPIC: 0,
        },
      });
    }).not.toThrow();
  });
});