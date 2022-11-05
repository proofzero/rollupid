// nftar/src/app.js

const {Blob} = require('node:buffer');
global.Blob = Blob;

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const Koa = require('koa');
const logger = require('koa-logger');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const Jsonrpc = require('@koalex/koa-json-rpc');
const streamToBlob = require('stream-to-blob');
const fabric = require('fabric').fabric;
const storage = require('nft.storage');
const Web3 = require('web3');
const sharp = require('sharp');
const imageDataURI = require('image-data-uri');
const FormData = require('form-data');

const {
    isPFPOwner,
    calculateNFTWeight,
    calculateSpecialWeight,
    calculateBalanceWeight,
    generateTraits
} = require('./utils.js');

const {
    getContractAddresses,
} = require('./traits.js');

const canvas = require('./canvas/canvas.js');

// const {
//     animationViewer
// } = require('./views/nftar.js');

const app     = new Koa();
app.use(bodyParser());

const router  = new Router();

const jsonrpc = new Jsonrpc({
    bodyParser: bodyParser({
        onerror: (err, ctx) => {
            ctx.status = 200;
            ctx.body = Jsonrpc.parseError;
        }
    })
});

const CHAINS = {
    ETH: 'ethereum',
};

// TODO: is there a better way to do this? e.g., open API yaml?
const METHOD_PARAMS = {
    '3id_genPFP': {
        'account': {
            type: 'string',
            description: 'blockchain account used to genearate the PFP'
        },
        'blockchain': {
            type: 'object',
            description: 'which blockchain this account belongs to',
            properties: {
                'name': {
                    type: 'string',
                    description: 'name of the blockchain',
                    enum: [CHAINS.ETH],
                },
                'chainId': {
                    type: 'number',
                    description: 'chain id of the blockchain'
                }
            }
        },
    },
    '3id_genInvite': {
        'recipient': {
            type: 'string',
            description: 'blockchain account to award the invite'
        },
        'inviteId': {
            type: 'string',
            description: 'Invite serial number'
        },
        'inviteTier': {
            type: 'string',
            description: 'Invite tier'
        },
        'issueDate': {
            type: 'string',
            description: 'Date the invite was issued'
        },
    },
    'describe': {},
};

// Accepts a blockchain account to generate a unique PFP.
//
// Properties are generated per account and saved; will check if a
// property has already been generated.
jsonrpc.method('3id_genPFP', async (ctx, next) => {
    const s0 = performance.now();
    const key = ctx.request.headers.authorization ? ctx.request.headers.authorization.replace("Bearer ","") : null
    
    if (ctx.apiKey && !key) {
        ctx.throw(403, 'Missing NFTAR API key');
    }
    if (key !== ctx.apiKey && key !== ctx.devKey) {
        ctx.throw(401, 'Invalid NFTAR API key');
    }
    const params = METHOD_PARAMS['3id_genPFP'];
    
    const account = ctx.jsonrpc.params['account'];
    if (!account){
        ctx.throw(401, 'account is required');
    }
    
    const blockchain = ctx.jsonrpc.params['blockchain'];
    if (!blockchain){
        ctx.throw(401, 'blockchain is required');
    } else if (!params.blockchain.properties.name.enum.includes(blockchain.name)){
        ctx.throw(401, `${blockchain.name} is not a valid blockchain. Valid blockchains are: ${params.blockchain.properties.name.enum.join(', ')}.`);
    }
    
    // eth only atm
    if (blockchain.name == CHAINS.ETH && !Web3.utils.isAddress(account)) {
        ctx.throw(401, 'account is not a valid address');
    }
    
    // derive weight inc for each trait
    let t0, t1;
    const weightInc = {};
    t0 = performance.now();

    // Alchemy accepts a maximum of 20 contracts.
    // cf. https://docs.alchemy.com/reference/sdk-getnfts
    const MAX_ALCHEMY_CONTRACT_ARRAY_SIZE = 20;
    const contractAddresses = getContractAddresses().slice(0, MAX_ALCHEMY_CONTRACT_ARRAY_SIZE);
    console.log('contractAddresses list:', JSON.stringify(contractAddresses));

    const nftsForOwner = await ctx.alchemy.nft.getNftsForOwner(account, {
        contractAddresses
    });
    console.log('nftsForOwner:', JSON.stringify(nftsForOwner));

    t1 = performance.now();
    console.log(`Call to alchemy took ${t1 - t0} milliseconds.`);

    // If the client wants us to check Alchemy to see if the NFT has been
    // minted, but has the image and wants to skip expensive operations, it
    // sends a queryparam called 'skipImage' set to true.
    const skipImage = (new URL(ctx.request.href)).searchParams.get('skipImage') === 'true';
    if (skipImage) {
        ctx.body = {
            skipImage
        };
        const s1 = performance.now();
        console.log(`Total took ${s1 - s0} milliseconds.`);
        return;
    }

    // TRAIT ONE: POPULAR COLLECTIONS
    weightInc['trait1'] = calculateNFTWeight(nftsForOwner.ownedNfts);

    // TRAIT TWO: SPECIAL COLLECTIONS
    weightInc['trait2'] = calculateSpecialWeight(nftsForOwner.ownedNfts);

    // TRAIT THREE: WALLET BALLANCE
    t0 = performance.now();
    const balanceWei = await ctx.web3.eth.getBalance(account);
    const balanceEth = ctx.web3.utils.fromWei(balanceWei, 'ether');
    weightInc['trait3'] = calculateBalanceWeight(balanceEth);
    t1 = performance.now();
    console.log(`Call to getBalance took ${t1 - t0} milliseconds.`);

    t0 = performance.now();
    const genTraits = generateTraits(weightInc);
    const colors = Object.keys(genTraits).map((k) => genTraits[k].value);
    t1 = performance.now();
    console.log(`Call to generateTraits took ${t1 - t0} milliseconds.`);

    const isNode = () => typeof window === 'undefined';

    const PFP_SQUARE_DIMENSION = 1000;
    const PFP_WIDTH = PFP_SQUARE_DIMENSION;
    const PFP_HEIGHT = PFP_SQUARE_DIMENSION;

    const pfp_gradient = new canvas(
        new fabric.StaticCanvas(null, { width: PFP_WIDTH, height: PFP_HEIGHT }),
        colors
    );

    // We make a double-width version with the same color seeds for the cover
    // image.
    t0 = performance.now();
    const cvr_gradient = new canvas(
        new fabric.StaticCanvas(null, { width: PFP_WIDTH * 2, height: PFP_HEIGHT }),
        colors
    );

    let pfp_stream;
    let cvr_stream;
    
    if (isNode()) {
        // Generate a single frame; call animate() to produce an animation.
        pfp_stream = pfp_gradient.snapshot();
        cvr_stream = cvr_gradient.snapshot();
    } else {
        // NB: freeze() returns a Data URL.
        pfp_stream = await pfp_gradient.freeze();
        cvr_stream = await cvr_gradient.freeze();
    }
    
    const imageFormat = "image/png";
    //const htmlFormat = "text/html";

    const pfp_blob = await streamToBlob(pfp_stream, imageFormat);
    const cvr_blob = await streamToBlob(cvr_stream, imageFormat);
    //const ani_blob = animationViewer(account, genTraits);
    t1 = performance.now();
    console.log(`Generating image took ${t1 - t0} milliseconds.`);

    // nft.storage File objects are automatically uploaded.
    t0 = performance.now();
    const png = new storage.File([pfp_blob], "threeid.png", {type: imageFormat});
    const cvr = new storage.File([cvr_blob], "cover.png", {type: imageFormat});
    //const ani = new storage.File([ani_blob], "index.html", {type: htmlFormat});
    t1 = performance.now();
    console.log(`File blobbing took ${t1 - t0} milliseconds.`);

    // Put the account in the metadata object so it's not a trait.
    blockchain.account = account;

    t0 = performance.now();
    // Upload to NFT.storage.
    const metadata = await ctx.storage.store({
        name: `3ID PFP: GEN 0`,
        description: `3ID PFP for ${account}`,
        image: png,
        cover: cvr,
        external_url: `https://3id.kubelt.com/${account}`,
        //animation_url: ani,
        properties: {
            metadata: blockchain,
            traits: genTraits,
            "GEN": genTraits.trait0.value.name,
            "Priority": genTraits.trait1.value.name,
            "Friend": genTraits.trait2.value.name,
            "Points": genTraits.trait3.value.name,
        },
    });
    t1 = performance.now();
    console.log(`NFT.storage took ${t1 - t0} milliseconds.`);

    //console.log('IPFS URL for the metadata:', metadata.url);
    //console.log('metadata.json contents:\n', metadata.data);
    //console.log('metadata.json with IPFS gateway URLs:', metadata.embed());
    
    t0 = performance.now();
    // Fire-and-forget to prewarm gateway. Catch (particularly) ETIMEDOUT to stop the container crashing.
    fetch(`https://nftstorage.link/ipfs/${metadata.data.image.host}/threeid.png`).catch(e => console.log('fire-and-forget failed:', JSON.stringify(e)));
    t1 = performance.now();
    console.log(`Fire and forget took ${t1 - t0} milliseconds.`);
    
    // This is the URI that will be passed to the NFT minting contract.
    const tokenURI = metadata.url;
    
    // Generate signed voucher using ctx.wallet.
    const voucher = {
        recipient: account,
        uri: tokenURI,
    };
    
    // In Solidity this is equivalent to...
    // `keccak256(abi.encodePacked(voucher.account, voucher.tokenURI))`
    // ... which is the hash we want to replicate for signer recovery.
    t0 = performance.now();
    const packedHash = ctx.web3.utils.soliditySha3({
        type: 'address',
        value: voucher.recipient
    }, {
        type: 'string',
        value: voucher.uri
    });

    // NB: A signed message is prefixed with "\x19Ethereum Signed
    // Message:\n" and the length of the message, using the hashMessage
    // method, so that it is EIP-191 compliant. If recovering the
    // address in Solidity, this prefix will be required to create a
    // matching hash.
    const signature = await ctx.wallet.sign(packedHash);

    // The smart contract expects the signature as part of the voucher
    // so we add it here to make integrations as easy as possible.
    voucher.signature = signature.signature;
    t1 = performance.now();
    console.log(`Crypto took ${t1 - t0} milliseconds.`);

    // Generate the response to send to the client.
    ctx.body = {
      metadata: metadata.data,
      voucher,
      signature,
    };
    const s1 = performance.now();
    console.log(`Total took ${s1 - s0} milliseconds.`);
});

const genInvite = async (ctx, next) => {
    const key = ctx.request.headers.authorization ? ctx.request.headers.authorization.replace("Bearer ","") : null
    
    if (ctx.apiKey && !key) {
        ctx.throw(403, 'Missing NFTAR API key');
    }

    if (key !== ctx.apiKey && key !== ctx.devKey) {
        ctx.throw(401, 'Invalid NFTAR API key');
    }
    
    let inviteId = ctx.jsonrpc.params['inviteId'];
    const inviteTier = ctx.jsonrpc.params['inviteTier'];
    const issueDate = Intl.DateTimeFormat('en-GB-u-ca-iso8601').format(Date.now());
    const assetFile = "./assets/3ID_NFT_CARD_NO_BG.svg"
    const OUTPUT_DIR = path.resolve("outputs");
    
    const recipient = ctx.jsonrpc.params['recipient'];
    
    console.log('genInvite:', JSON.stringify({
        recipient,
        inviteId,
        inviteTier,
        issueDate,
    }), 'with API key:', key === ctx.apiKey, 'with DEV key:', key === ctx.devKey);
    
    await fs.promises.mkdir(OUTPUT_DIR, { recursive: true });
    const outputFile = path.join("outputs", `invite-${inviteId}.svg`);
    const baseName = path.basename(outputFile);

    inviteId = inviteId.toString().padStart(4, "0");

    const newCard = await fs.promises.readFile(assetFile, 'utf8')
      .then(data => {
        // Parse the SVG XML data and return a query context.
        return cheerio.load(data, {
          xml: {},
        });
      })
      .then(($) => {
        /*
        <svg>
          ...
          <text id="ISSUED">04/20/2022</text>
          <text id="NUMBER">#6969</text>
        </svg>
        */
        // Set the issue date.
        $('#ISSUED').text(issueDate);
        // Set the invite identifier.
        $('#NUMBER').text(`#${inviteId}`);

        const svgText = $.root().html();
        if (null === svgText) {
          throw "empty SVG document generated";
        }
        return svgText.trim();
      })
      .then(svgText => {
        return fs.promises.writeFile(outputFile, svgText);
      })

     // Utility to title-case a string.
    const titleCase = (s) => {
        return s.charAt(0).toUpperCase() + s.slice(1);
    };

    // Upload to NFT.storage.
    const metadata = {
        name: `3ID Invite #${inviteId}`,
        description: `${titleCase(inviteTier)} 3ID Invite`,
        image: new storage.File(
            [await fs.promises.readFile(outputFile)],
            baseName,
            { type: 'image/svg+xml' },
        ),
        properties: {
            inviteId,
            inviteTier,
            issueDate,
        }
    };

    t0 = performance.now();
    const result = await ctx.storage.store(metadata);
    t1 = performance.now();
    console.log(`genInvite: ctx.storage.store took ${t1 - t0} milliseconds.`);
    
    ctx.body = {
        // IPFS URL of the metadata
        url: result.url,
        // The metadata.json contents
        metadata: result.data,
        // metadata.json contents with IPFS gateway URLs
        embed: result.embed(),
      };
};

jsonrpc.method('3id_genInvite', genInvite);
jsonrpc.method('3iD_genInvite', genInvite);

jsonrpc.method('describe', (ctx, next) => {
    ctx.body = jsonrpc.methods.map(method => {
        return {
            name: method,
            params: METHOD_PARAMS[method] || {}
        };
    });
});

router.post('/api', jsonrpc.middleware);

// REST handler for op-image verification.
router.post('/api/v0/og-image', async (ctx, next) => {
    const key = ctx.request.headers.authorization ? ctx.request.headers.authorization.replace("Bearer ","") : null

    if (ctx.apiKey && !key) {
        ctx.throw(403, 'Missing NFTAR API key');
    }

    if (key !== ctx.apiKey && key !== ctx.devKey) {
        ctx.throw(401, 'Invalid NFTAR API key');
    }

    if (!ctx.cloudflare || !ctx.cloudflare.accountId || !ctx.cloudflare.accountHash || !ctx.cloudflare.imageToken) {
        ctx.throw(500, 'Missing image service configuration');
    }

    const bkg = ctx.request.body.bkg;
    const hex = ctx.request.body.hex;

    if (!bkg || !hex) {
        ctx.throw(500, 'Missing bkg or hex parameter');
    }

    let bkgURL, hexURL;

    // Validate that we've been passed well-formed URLs.
    try {
        bkgURL = new URL(ctx.request.body.bkg);
        hexURL = new URL(ctx.request.body.hex);
    } catch (e) {
        ctx.throw(500, 'Malformed bkg or hex parameter');
    }

    // NOTE: Unique cache key (big assumption here that the passed image urls are, themselves, unique).
    const filename = Web3.utils.keccak256(bkgURL.href + hexURL.href);

    // Check the image service to see if the cache key already exists.
    const url = `https://imagedelivery.net/${ctx.cloudflare.accountHash}/${filename}/public`;
    console.log('Checking cache:', url);
    const cacheCheck = await fetch(url);
    
    if (cacheCheck.status === 200) {
        console.log('Returning cached image url for ', filename);
        ctx.set('Content-Type', 'application/json');
        ctx.body = { url };
    } else if (cacheCheck.status === 404) {
        console.log(`Cache miss for ${filename}. Generating new image.`);

        // Images that are remote need to be converted to Data URIs so that we can
        // render the SVG without triggering a cross-origin security violation.
        const bkgURI = await imageDataURI.encodeFromURL(bkgURL.href).catch((e) => {
            console.log(filename, 'failed to encode background image');
            ctx.throw(500, `Image encoding error: ${JSON.stringify(e)}`);
        });

        const hexURI = await imageDataURI.encodeFromURL(hexURL.href).catch((e) => {
            console.log(filename, 'failed to encode hexagon image');
            ctx.throw(500, `Image encoding error: ${JSON.stringify(e)}`);
        });

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
        const pngBuffer = await sharp(Buffer.from(svg)).toFormat('png').toBuffer();
        
        // Cloudflare Image service requires we submit by POSTing FormData in order
        // to set our own filename (cache key).
        const form = new FormData();
        form.append('file', pngBuffer, { filename }); // Name file after cache key.
        form.append('id', filename); // Set the cache key as the Cloudflare "Custom ID".
        
        // Get the headers from the FormData object so that we can pick up
        // the dynamically generated multipart boundary.
        const headers = form.getHeaders();
        headers['authorization'] = `bearer ${ctx.cloudflare.imageToken}`;
        
        // This fire-and-forget call could fail because the image service has a race condition on uploads.
        // It might cache miss above, get here, and then try to upload something that already exists,
        // which will cause this to return "ERROR 5409: Resource already exists".
        fetch(`https://api.cloudflare.com/client/v4/accounts/${ctx.cloudflare.accountId}/images/v1`, {
            method: 'POST',
            body: form,
            headers
        });

        ctx.set('Content-Type', 'application/json');
        ctx.body = { url };
    } else {
        ctx.set('Content-Type', 'application/json');
        ctx.status = 500;
        ctx.body = `{ "err": "Application Error: Image Service returned bad non-200, non-404 response '${cacheCheck.status}' for ${filename} (search for this in logs)." }`;
        console.log(filename, JSON.stringify(cacheCheck));
    }

    return next();
});

app.use(logger());
app.use(router.routes());

module.exports = app;
