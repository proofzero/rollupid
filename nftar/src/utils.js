const Probability = require('./probability.js')
const {TRAIT_CATEGORIES, V0_COLORS} = require('./traits.js');

const generateTraits = function(wi1, wi2, wi3) {
    // GENERATE PFP Properties
    const probability = new Probability();
    
    // TRAIT 1
    // TODO: increase weight of categories based 
    const wtrait1t = new Probability(TRAIT_CATEGORIES);
    wtrait1t.addWeight('COMMON', wi1 % 2);
    wtrait1t.addWeight('UNCOMMON', wi1 % 3);
    wtrait1t.addWeight('RARE', wi1 % 4);
    wtrait1t.addWeight('EPIC', wi1 % 5);
    const trait_1_type = wtrait1t.peek()[0];
    
    const wtrait1v = new Probability(V0_COLORS[trait_1_type]);
    const trait_1_value = wtrait1v.peek()[0];

    // TRAIT 2
    // do some checks to increase the probability of a trait
    var wtrait2t = new Probability(TRAIT_CATEGORIES);
    wtrait2t.addWeight('COMMON', wi2 % 2);
    wtrait2t.addWeight('UNCOMMON', wi2 % 3);
    wtrait2t.addWeight('RARE', wi2 % 4);
    wtrait2t.addWeight('EPIC', wi2 % 5);
    const trait_2_type = wtrait2t.peek()[0];

    const wtrait2v = new Probability(V0_COLORS[trait_2_type]);
    const trait_2_value = wtrait2v.peek()[0];


    // TRAIT 3
    // do some checks to increase the probability of a trait
    var wtrait3t = new Probability(TRAIT_CATEGORIES);
    wtrait3t.addWeight('COMMON', wi3 % 2);
    wtrait3t.addWeight('UNCOMMON', wi3 % 3);
    wtrait3t.addWeight('RARE', wi3 % 4);
    wtrait3t.addWeight('EPIC', wi3 % 5);
    const trait_3_type = wtrait3t.peek()[0];

    const wtrait3v = new Probability(V0_COLORS[trait_3_type]);
    const trait_3_value = wtrait3v.peek()[0];

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
    generateTraits,
}