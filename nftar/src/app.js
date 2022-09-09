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
    calculateNFTWeight,
    calculateSpecialWeight,
    calculateBalanceWeight,
    generateTraits
} = require('./utils.js');
const canvas = require('./canvas/canvas.js');

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
        'inviteId': {
            type: 'string',
            description: 'Invite serial number'
        },
    },
    'describe': {},
};

// Accepts a blockchain account to generate a unique PFP.
//
// Properties are generated per account and saved; will check if a
// property has already been generated.
jsonrpc.method('3id_genPFP', async (ctx, next) => {
    const key = ctx.request.headers.authorization ? ctx.request.headers.authorization.replace("Bearer ","") : null
    if (ctx.apiKey && !key) {
        ctx.throw(400, 'Missing NFTAR API key');
    }
    if (key !== ctx.apiKey) {
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
    const weightInc = {};
    const nftsForOwner = await ctx.alchemy.nft.getNftsForOwner(account);
    
    // TRAIT ONE: POPULAR COLLECTIONS
    weightInc['trait1'] = calculateNFTWeight(nftsForOwner.ownedNfts);
    // TRAIT TWO: SPECIAL COLLECTIONS
    weightInc['trait2'] = calculateSpecialWeight(nftsForOwner.ownedNfts);
    // TRAIT THREE: WALLET BALLANCE
    const balanceWei = await ctx.web3.eth.getBalance(account);
    const balanceEth = ctx.web3.utils.fromWei(balanceWei, 'ether');
    weightInc['trait3'] = calculateBalanceWeight(balanceEth);

    const genTraits = generateTraits(weightInc);
    const colors = Object.keys(genTraits).map((k) => genTraits[k].value);

    const isNode = () => {
        if (typeof window === 'undefined') {
            return true;
        }
        return false;
    };

    const gradient = new canvas(
        new fabric.StaticCanvas(null, { width: 1500, height: 750 }),
        colors
    );
    let stream;
    if (isNode()) {
        // Generate a single frame; call animate() to produce an animation.
        stream = gradient.snapshot();
    } else {
        // NB: freeze() returns a Data URL.
        stream = await gradient.freeze();
    }
    const imageFormat = "image/png";
    const blob = await streamToBlob(stream, imageFormat);
    const png = new storage.File([blob], "threeid.png", {type: imageFormat});

    // Upload to NFT.storage.
    const metadata = await ctx.storage.store({
        name: `3id`,
        description: `3id PFP for ${account}`,
        image: png,
        properties: {
            account,
            blockchain,
            traits: genTraits,
        },
    });
    //console.log('IPFS URL for the metadata:', metadata.url);
    //console.log('metadata.json contents:\n', metadata.data);
    //console.log('metadata.json with IPFS gateway URLs:', metadata.embed());

    //fire and forget to gateway
    fetch(`https://nftstorage.link/ipfs/${metadata.data.image.host}/threeid.png`)

    // This is the URI that will be passed to the NFT minting contract.
    const tokenURI = metadata.url;

    // Generate signed voucher using ctx.wallet.
    const voucher = {
        account,
        tokenURI,
    };

    // In Solidity this is equivalent to...
    // `keccak256(abi.encodePacked(voucher.account, voucher.tokenURI))`
    // ... which is the hash we want to replicate for signer recovery.
    const packedHash = ctx.web3.utils.soliditySha3({
        type: 'address',
        value: voucher.account
    }, {
        type: 'string',
        value: voucher.tokenURI
    });

    // NB: A signed message is prefixed with "\x19Ethereum Signed
    // Message:\n" and the length of the message, using the hashMessage
    // method, so that it is EIP-191 compliant. If recovering the
    // address in Solidity, this prefix will be required to create a
    // matching hash.
    const signature = await ctx.wallet.sign(packedHash);

    // Generate the response to send to the client.
    ctx.body = {
      metadata: metadata.data,
      voucher,
      signature,
    };
});

jsonrpc.method('3iD_genInvite', async (ctx, next) => {

    let inviteId = ctx.jsonrpc.params['inviteId'];
    const inviteTier = ctx.jsonrpc.params['inviteTier'];
    const issueDate = ctx.jsonrpc.params['issueDate'];
    const assetFile = "./assets/3ID_NFT_CARD_NO_BG.svg"
    const OUTPUT_DIR = path.resolve("outputs");

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

    console.log("here", metadata)


    const result = await ctx.storage.store(metadata);
    console.log("here", result)

    ctx.body = {
        // IPFS URL of the metadata
        url: result.url,
        // The metadata.json contents
        metadata: result.data,
        // metadata.json contents with IPFS gateway URLs
        embed: result.embed(),
      };
})



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
