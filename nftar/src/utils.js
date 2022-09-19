// nftar/src/utils.js

const Probability = require('./probability.js')
const {
    TRAIT_CATEGORIES,
    V0_COLORS,
    POPULAR_COLLECTIONS,
    SPECIAL_COLLECTIONS} = require('./traits.js');

const calculateNFTWeight = function(nfts) {
    const weights = {
        "EPIC": 0,
        "RARE": 0,
        "UNCOMMON": 0,
    };
    nfts.forEach(async (nft) => {
        const contract = POPULAR_COLLECTIONS[nft.contract]
        if (contract) {
            weights[contract.kind] += contract.value;
        }
    });
    return weights;
}

const calculateSpecialWeight = function(nfts) {
    const weights = {
        "EPIC": 0,
        "RARE": 0,
        "UNCOMMON": 0,
    };
    nfts.forEach(async (nft) => {
        const contract = SPECIAL_COLLECTIONS[nft.contract]
        if (contract) {
            weights[contract.kind] += contract.value;
        }
    });
    return weights;
}

const calculateBalanceWeight = function(balance) {
    const weights = {
        "EPIC": balance > 100 ? 1 : 0,
        "RARE": balance > 10 ? 1 : 0,
        "UNCOMMON": balance > 1 ? 1 : 0,
    };
    return weights;
}

const generateTraits = function(weightInc) {
    // GENERATE PFP Properties
    const NUMBER_OF_ELEMENTS = 1;
    const REMOVE_FROM_DISTRIBUTION = true;
    const colorProbability = new Probability(V0_COLORS);

    // TRAIT ONE: POPULAR COLLECTIONS
    const trait1Probability = new Probability(TRAIT_CATEGORIES);
    trait1Probability.addWeight('UNCOMMON', weightInc.trait1.UNCOMMON);
    trait1Probability.addWeight('RARE', weightInc.trait1.RARE);
    trait1Probability.addWeight('EPIC', weightInc.trait1.EPIC);
    const trait_1_type = trait1Probability.peek()[0];

    // TRAIT TWO: SPECIAL COLLECTIONS AND INVITATION
    const trait2Probability = new Probability(TRAIT_CATEGORIES);
    trait2Probability.addWeight('UNCOMMON', weightInc.trait2.UNCOMMON);
    trait2Probability.addWeight('RARE', weightInc.trait2.RARE);
    trait2Probability.addWeight('EPIC', weightInc.trait2.EPIC);
    const trait_2_type = trait2Probability.peek()[0];

    // TRAIT THREE: WALLET BALLANCE
    const trait3Probability = new Probability(TRAIT_CATEGORIES);
    trait3Probability.addWeight('UNCOMMON', weightInc.trait3.UNCOMMON);
    trait3Probability.addWeight('RARE', weightInc.trait3.RARE);
    trait3Probability.addWeight('EPIC', weightInc.trait3.EPIC);
    const trait_3_type = trait3Probability.peek()[0];

    // Get traits from the joint probability distribution.
    const trait_1_value = colorProbability.peek(NUMBER_OF_ELEMENTS, REMOVE_FROM_DISTRIBUTION)[0];
    const trait_2_value = colorProbability.peek(NUMBER_OF_ELEMENTS, REMOVE_FROM_DISTRIBUTION)[0];
    const trait_3_value = colorProbability.peek(NUMBER_OF_ELEMENTS, REMOVE_FROM_DISTRIBUTION)[0];

    // // TRAIT ONE: POPULAR COLLECTIONS
    // // TODO: increase weight of categories based
    // const wtrait1t = new Probability(TRAIT_CATEGORIES);
    // wtrait1t.addWeight('UNCOMMON', weightInc.trait1.UNCOMMON);
    // wtrait1t.addWeight('RARE', weightInc.trait1.RARE);
    // wtrait1t.addWeight('EPIC', weightInc.trait1.EPIC);
    // const trait_1_type = wtrait1t.peek()[0];
    // // const trait_1_type = wtrait1t.peek(NUMBER_OF_ELEMENTS, REMOVE_FROM_DISTRIBUTION)[0];

    // const wtrait1v = new Probability(V0_COLORS[trait_1_type]);
    // const trait_1_value = wtrait1v.peek()[0];
    // // const trait_1_value = wtrait1v.peek(NUMBER_OF_ELEMENTS, REMOVE_FROM_DISTRIBUTION)[0];

    // // TRAIT TWO: SPECIAL COLLECTIONS AND INVITATION
    // // do some checks to increase the probability of a trait
    // var wtrait2t = new Probability(TRAIT_CATEGORIES);
    // wtrait2t.addWeight('UNCOMMON', weightInc.trait2.UNCOMMON);
    // wtrait2t.addWeight('RARE', weightInc.trait2.RARE);
    // wtrait2t.addWeight('EPIC', weightInc.trait2.EPIC);
    // const trait_2_type = wtrait2t.peek()[0];
    // // const trait_2_type = wtrait2t.peek(NUMBER_OF_ELEMENTS, REMOVE_FROM_DISTRIBUTION)[0];

    // const wtrait2v = new Probability(V0_COLORS[trait_2_type]);
    // const trait_2_value = wtrait2v.peek()[0];
    // // const trait_2_value = wtrait2v.peek(NUMBER_OF_ELEMENTS, REMOVE_FROM_DISTRIBUTION)[0];

    // // TRAIT THREE: WALLET BALLANCE
    // // do some checks to increase the probability of a trait
    // var wtrait3t = new Probability(TRAIT_CATEGORIES);
    // wtrait3t.addWeight('UNCOMMON', weightInc.trait3.UNCOMMON);
    // wtrait3t.addWeight('RARE', weightInc.trait3.RARE);
    // wtrait3t.addWeight('EPIC', weightInc.trait3.EPIC);
    // const trait_3_type = wtrait3t.peek()[0];
    // // const trait_3_type = wtrait3t.peek(NUMBER_OF_ELEMENTS, REMOVE_FROM_DISTRIBUTION)[0];

    // const wtrait3v = new Probability(V0_COLORS[trait_3_type]);
    // const trait_3_value = wtrait3v.peek()[0];
    // // const trait_3_value = wtrait3v.peek(NUMBER_OF_ELEMENTS, REMOVE_FROM_DISTRIBUTION)[0];

    return {
        "trait0": {
            "type": "GEN",
            "value": {
                ...V0_COLORS.GEN[0].data,
                rnd: [Math.random(), Math.random(), Math.random(), Math.random(), Math.random(), Math.random()],
            }
        },
        "trait1": {
            type: trait_1_type,
            value: {
                ...trait_1_value.data,
                rnd: [Math.random(), Math.random(), Math.random(), Math.random(), Math.random(), Math.random()],
            }
        },
        "trait2": {
            type: trait_2_type,
            value: {
                ...trait_2_value.data,
                rnd: [Math.random(), Math.random(), Math.random(), Math.random(), Math.random(), Math.random()],
            }
        },
        "trait3": {
            type: trait_3_type,
            value: {
                ...trait_3_value.data,
                rnd: [Math.random(), Math.random(), Math.random(), Math.random(), Math.random(), Math.random()],
            }
        },
    }
}

module.exports = {
    calculateNFTWeight,
    calculateSpecialWeight,
    calculateBalanceWeight,
    generateTraits,
}
