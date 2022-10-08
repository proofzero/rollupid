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

const {
    isPFPOwner,
    calculateNFTWeight,
    calculateSpecialWeight,
    calculateBalanceWeight,
    generateTraits
} = require('./utils.js');

const canvas = require('./canvas/canvas.js');

// const {
//     animationViewer
// } = require('./views/nftar.js');

const app     = new Koa();
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

// If the user owns an NFT from the PFP contract this will throw a 409
// error UNLESS ctx.devKey is set (via the NFTAR_DEV_KEY envvar) and used.
const handleDuplicateGenerationRequest = function(contract, nfts, account, key, ctx) {
    // If the key from the header is not undefined AND the devKey from the 
    // environment is not undefined AND the two are equal THEN we're in
    // development mode and will skip the duplicate PFP check.
    const isDevMode = (key !== undefined && ctx.devKey !== undefined && key === ctx.devKey);
    if (isDevMode) {
        return true;
    }

    // If the user owns an NFT from the given contract, 409 error.
    if (nfts.ownedNfts.length) {
        ctx.throw(409, `${account} already owns an NFT from ${contract}!`);
    }    
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
    const nftsForOwner = await ctx.alchemy.nft.getNftsForOwner(account, {
        contractAddresses: [ctx.pfp_contract]
    });
    t1 = performance.now();
    console.log(`Call to alchemy took ${t1 - t0} milliseconds.`);

    // If the user owns an NFT from the PFP contract this will throw a 409
    // error UNLESS ctx.devKey is used (set via the NFTAR_DEV_KEY envvar).
    handleDuplicateGenerationRequest(ctx.pfp_contract, nftsForOwner, account, key, ctx);

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
    
    //fire and forget to gateway
    t0 = performance.now();
    fetch(`https://nftstorage.link/ipfs/${metadata.data.image.host}/threeid.png`)
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

    let t0 = performance.now();
    if (recipient) {
        const nftsForOwner = await ctx.alchemy.nft.getNftsForOwner(recipient, {
            contractAddresses: [ctx.invite_contract]
        });
        
        // If the user owns an NFT from the invite contract this will throw a 409
        // error UNLESS ctx.devKey is used (set via the NFTAR_DEV_KEY envvar).
        handleDuplicateGenerationRequest(ctx.invite_contract, nftsForOwner, recipient, key, ctx);
    }
    let t1 = performance.now();
    console.log(`genInvite: recipient ownership check took ${t1 - t0} milliseconds.`);
    
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

app.use(logger());
app.use(router.routes());


module.exports = app;
