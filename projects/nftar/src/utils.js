// nftar/src/utils.js

const Probability = require('./probability.js')
const imageDataURI = require('image-data-uri')

const {
    TRAIT_CATEGORIES,
    V0_COLORS,
    POPULAR_COLLECTIONS,
    SPECIAL_COLLECTIONS
} = require('./traits.js');

const calculateNFTWeight = function(nfts) {
    const weights = {
        "EPIC": 0,
        "RARE": 0,
        "UNCOMMON": 0,
        "COMMON": 0,
    };
    if (nfts.constructor !== Array) return weights;

    for (const i in nfts) {
        const nft = nfts[i];
        const contract = POPULAR_COLLECTIONS[nft.contract.address]
        if (contract) {
            weights[contract.kind] += contract.value;
        }
    }
    return weights;
}

const calculateSpecialWeight = function(nfts) {
    const weights = {
        "EPIC": 0,
        "RARE": 0,
        "UNCOMMON": 0,
        "COMMON": 0,
    };
    if (nfts.constructor !== Array) return weights;

    for (const i in nfts) {
        const nft = nfts[i];
        const contract = SPECIAL_COLLECTIONS[nft.contract.address]
        if (contract) {
            weights[contract.kind] += contract.value;
        }
    }
    return weights;
}

const calculateBalanceWeight = function(balance) {
    return {
        "EPIC": balance > 100 ? 1 : 0,
        "RARE": balance <= 100 && balance > 10 ? 1 : 0,
        "UNCOMMON": balance <= 10 && balance ? 1 : 0,
        "COMMON": 0,
    };
}

// Subtract the returned color from the colors trait array
// so that we can stop duplication.
const preserveColorWeights = function(color, colors) {
    for (let i in colors) {
        if (color.key == colors[i].key) {
            colors[i].weight = colors[i].weight - 1;
            if (colors[i].weight <= 0) {
                delete colors[i];
            }
            break;
        }
    }
    // The deleted item remains in the array as an undefined
    // element. This filter drops falsy (ie undefined) elements.
    return colors.filter(Boolean);
}

const generateTraits = function(weightInc) {
    // GENERATE PFP Properties
    const NUMBER_OF_ELEMENTS = 1;
    const REMOVE_FROM_DISTRIBUTION = true;

    // Instance the V0_COLORS object so it can be called repeatedly. Otherwise
    // it will be shared across calls if the process doesn't restart.
    const COLORS = JSON.parse(JSON.stringify(V0_COLORS));
    
    // TRAIT ONE: POPULAR COLLECTIONS
    const trait1Probability = new Probability(TRAIT_CATEGORIES);
    trait1Probability.addWeight('COMMON', weightInc.trait1.COMMON);
    trait1Probability.addWeight('UNCOMMON', weightInc.trait1.UNCOMMON);
    trait1Probability.addWeight('RARE', weightInc.trait1.RARE);
    trait1Probability.addWeight('EPIC', weightInc.trait1.EPIC);
    // console.log('trait1Probability.peek()[0]')
    const trait_1_type = trait1Probability.peek()[0];
    
    // TRAIT TWO: SPECIAL COLLECTIONS AND INVITATION
    const trait2Probability = new Probability(TRAIT_CATEGORIES);
    trait2Probability.addWeight('COMMON', weightInc.trait2.COMMON);
    trait2Probability.addWeight('UNCOMMON', weightInc.trait2.UNCOMMON);
    trait2Probability.addWeight('RARE', weightInc.trait2.RARE);
    trait2Probability.addWeight('EPIC', weightInc.trait2.EPIC);
    // console.log('trait2Probability.peek()[0]')
    const trait_2_type = trait2Probability.peek()[0];
    
    // TRAIT THREE: WALLET BALLANCE
    const trait3Probability = new Probability(TRAIT_CATEGORIES);
    trait3Probability.addWeight('COMMON', weightInc.trait3.COMMON);
    trait3Probability.addWeight('UNCOMMON', weightInc.trait3.UNCOMMON);
    trait3Probability.addWeight('RARE', weightInc.trait3.RARE);
    trait3Probability.addWeight('EPIC', weightInc.trait3.EPIC);
    // console.log('trait3Probability.peek()[0]')
    const trait_3_type = trait3Probability.peek()[0];
    
    // Get traits from the joint probability distribution of colors.
    let colorProbability = new Probability(COLORS[trait_1_type]);
    // console.log('trait1: colorProbability.peek(NUMBER_OF_ELEMENTS, REMOVE_FROM_DISTRIBUTION)[0]:', trait_1_type, COLORS['GEN'].length, COLORS['COMMON'].length, COLORS['UNCOMMON'].length, COLORS['RARE'].length, COLORS['EPIC'].length)
    const trait_1_value = colorProbability.peek(NUMBER_OF_ELEMENTS, REMOVE_FROM_DISTRIBUTION)[0];
    COLORS[trait_1_type] = preserveColorWeights(trait_1_value, COLORS[trait_1_type]);

    colorProbability = new Probability(COLORS[trait_2_type]);
    // console.log('trait2: colorProbability.peek(NUMBER_OF_ELEMENTS, REMOVE_FROM_DISTRIBUTION)[0]:', trait_2_type, COLORS['GEN'].length, COLORS['COMMON'].length, COLORS['UNCOMMON'].length, COLORS['RARE'].length, COLORS['EPIC'].length)
    const trait_2_value = colorProbability.peek(NUMBER_OF_ELEMENTS, REMOVE_FROM_DISTRIBUTION)[0];
    COLORS[trait_2_type] = preserveColorWeights(trait_2_value, COLORS[trait_2_type]);

    // Because there are only two epic traits we could, in theory, underflow.
    // We give the peek function a default to return in this (rare) case.
    const trait_3_default = { key: 'default', data: { name: 'Magenta', rgb: { r: 255, g: 0, b: 255 } } };
    colorProbability = new Probability(COLORS[trait_3_type]);
    // console.log('trait3: colorProbability.peek(NUMBER_OF_ELEMENTS, REMOVE_FROM_DISTRIBUTION)[0]:', trait_3_type, COLORS['GEN'].length, COLORS['COMMON'].length, COLORS['UNCOMMON'].length, COLORS['RARE'].length, COLORS['EPIC'].length)
    const trait_3_value = colorProbability.peek(NUMBER_OF_ELEMENTS, REMOVE_FROM_DISTRIBUTION, trait_3_default)[0];
    COLORS[trait_3_type] = preserveColorWeights(trait_3_value, COLORS[trait_3_type]);

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

// Attempt to download arbitrary images and encode them as data URIs with the
// image-data-uri library. We cannot use the remote calls offered by
// image-data-uri because it uses a legacy HTTP library that Cryptopunks 403
// blocks when called from GCP (for some reason). We need more control so we
// use the fetch API and pass the bytes retrieved into the library's encoder.
const encodeDataURI = async (ctx, url) => {
    return fetch(url)
    // Get the content type and unfortunately await the body. I would prefer
    // that retrieving the body here was thennable, but need the header.
    .then(async r => [r.headers.get('content-type'), await r.arrayBuffer()])

    // Encode the bytes into a data URI, given their content type.
    .then(([contentType, hexBuffer]) =>
        imageDataURI.encode(Buffer.from(hexBuffer), contentType))

    // Error logging and status responses.
    .catch(e => {
        console.log(`failed to encode image ${url} as data URI`)
        ctx.throw(500, `Image encoding error: ${JSON.stringify(e)}`)
    })
}

module.exports = {
    calculateNFTWeight,
    calculateSpecialWeight,
    calculateBalanceWeight,
    generateTraits,
    encodeDataURI
}
