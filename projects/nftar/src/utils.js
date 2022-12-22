// nftar/src/utils.js

const Probability = require('./probability.js')
const imageDataURI = require('image-data-uri')
const FormData = require('form-data')
const { convert } = require('convert-svg-to-png');
const Web3 = require('web3');

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
const encodeDataURI = async (url) => {
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
        // ctx.throw(500, `Image encoding error: ${JSON.stringify(e)}`)
    })
}

// Uploads an image stream to the Cloudflare Image service with a custom ID.
const uploadImage = async (cloudflareConfig, customId, stream, contentType = 'image/png') => {
    // Cloudflare Image service requires we submit by POSTing FormData in order
    // to set our own filename (cache key).
    const form = new FormData();
    form.append('file', stream, { filename: customId, contentType });
    form.append('id', customId);
    
    // Get the headers from the FormData object so that we can pick up
    // the dynamically generated multipart boundary.
    const headers = form.getHeaders();
    headers['authorization'] = `bearer ${cloudflareConfig.imageToken}`;
    
    return fetch(`https://api.cloudflare.com/client/v4/accounts/${cloudflareConfig.accountId}/images/v1`, {
        method: 'POST',
        body: form,
        headers
    });
}

const generateOGImage = async (cloudflareConfig, bkgURL, hexURL, filename) => {

    if (!filename) {
        // NOTE: Unique cache key (big assumption here that the passed image urls are, themselves, unique).
        filename = Web3.utils.keccak256(bkgURL.href + hexURL.href);
    }

    // Images that are remote need to be converted to Data URIs so that we can
    // render the SVG without triggering a cross-origin security violation.
    const hexURI = await encodeDataURI(hexURL.href)
    const bkgURI = await encodeDataURI(bkgURL.href)

    // Constants for populating the SVG (optional).
    const OG_WIDTH = 1200;
    const OG_HEIGHT = 630;

    // TODO: Load from assets folder?
    const svg =
    `<svg width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="url(#Backround)"/>
        <path d="M752.632 246.89C740.674 221.745 726.731 197.594 710.932 174.666L705.837 167.342C699.563 158.24 691.341 150.65 681.768 145.124C672.194 139.597 661.508 136.273 650.489 135.392L641.543 134.671C613.787 132.443 585.899 132.443 558.145 134.671L549.199 135.392C538.179 136.273 527.494 139.597 517.921 145.124C508.347 150.65 500.124 158.24 493.851 167.342L488.755 174.732C472.958 197.66 459.014 221.811 447.056 246.956L443.206 255.05C438.462 265.033 436 275.947 436 287C436 298.053 438.462 308.967 443.206 318.95L447.056 327.044C459.014 352.19 472.958 376.341 488.755 399.268L493.851 406.658C500.124 415.759 508.347 423.35 517.921 428.877C527.494 434.403 538.179 437.728 549.199 438.608L558.145 439.329C585.899 441.557 613.787 441.557 641.543 439.329L650.489 438.608C661.516 437.716 672.207 434.377 681.781 428.833C691.356 423.288 699.573 415.679 705.837 406.559L710.932 399.17C726.731 376.243 740.674 352.092 752.632 326.946L756.482 318.852C761.225 308.869 763.688 297.955 763.688 286.902C763.688 275.849 761.225 264.935 756.482 254.951L752.632 246.89Z" fill="white"/>
        <mask id="mask0_1_24" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="446" y="142" width="307" height="289">
        <path d="M742.673 249.319C731.507 225.839 718.487 203.286 703.734 181.876L698.976 175.036C693.117 166.537 685.439 159.449 676.499 154.288C667.559 149.127 657.581 146.023 647.291 145.201L638.937 144.528C613.018 142.447 586.976 142.447 561.058 144.528L552.704 145.201C542.414 146.023 532.437 149.127 523.496 154.288C514.556 159.449 506.878 166.537 501.02 175.036L496.262 181.937C481.509 203.347 468.488 225.9 457.322 249.381L453.727 256.939C449.296 266.261 446.998 276.453 446.998 286.775C446.998 297.096 449.296 307.288 453.727 316.61L457.322 324.168C468.488 347.65 481.509 370.203 496.262 391.612L501.02 398.513C506.878 407.012 514.556 414.101 523.496 419.261C532.437 424.422 542.414 427.527 552.704 428.348L561.058 429.021C586.976 431.102 613.018 431.102 638.937 429.021L647.291 428.348C657.588 427.516 667.572 424.398 676.512 419.22C685.453 414.042 693.126 406.937 698.976 398.421L703.734 391.52C718.487 370.111 731.507 347.558 742.673 324.077L746.269 316.518C750.698 307.196 752.998 297.004 752.998 286.683C752.998 276.361 750.698 266.169 746.269 256.847L742.673 249.319Z" fill="white"/>
        </mask>
        <g mask="url(#mask0_1_24)">
        <rect x="447" y="132.756" width="305.604" height="305.604" fill="url(#hexagon)"/>
        </g>
        <defs>
        <pattern id="Backround" patternContentUnits="objectBoundingBox" width="1" height="1">
            <use xlink:href="#backroundimage" transform="translate(0 -0.452381) scale(0.015625 0.0297619)"/>
        </pattern>
        <pattern id="hexagon" patternContentUnits="objectBoundingBox" width="1" height="1">
            <use xlink:href="#hexagonimage" transform="translate(-1.98598) scale(0.00233645)"/>
        </pattern>
        <image id="backroundimage" width="64" height="64" xlink:href="${bkgURI}"/>
        <image id="hexagonimage" width="2128" height="428" xlink:href="${hexURI}"/>
        </defs>
    </svg>`;

    // Convert the populated SVG template into a PNG byte stream.
    const pngBuffer = await convert(svg, {
        puppeteer: {
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        }
    });

    // This fire-and-forget call could fail because the image service has a race condition on uploads.
    // It might cache miss above, get here, and then try to upload something that already exists,
    // which will cause this to return "ERROR 5409: Resource already exists".
    await uploadImage(cloudflareConfig, filename, pngBuffer).then(() => console.log(`Uploaded ${filename}`))
}

module.exports = {
    calculateNFTWeight,
    calculateSpecialWeight,
    calculateBalanceWeight,
    generateTraits,
    encodeDataURI,
    uploadImage,
    generateOGImage
}
