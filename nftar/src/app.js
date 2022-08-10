// nftar/src/app.js

const {Blob} = require('node:buffer');
global.Blob = Blob;

const Koa = require('koa');
const logger = require('koa-logger');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const Jsonrpc = require('@koalex/koa-json-rpc');
// const canvas = require('canvas')
const streamToBlob = require('stream-to-blob')
const fabric = require('fabric').fabric;
const views = require('koa-views');
const mount = require('koa-mount');
const serve = require('koa-better-serve');
const storage = require('nft.storage');
const path = require('path');
const Web3 = require('web3');

const Probability = require('./probability.js');
const {TRAIT_CATEGORIES, V0_COLORS} = require('./traits.js');
const {generateTraits} = require('./utils.js');
const canvas = require('./canvas/canvas.js');

const app     = new Koa();
const router  = new Router();

app.use(mount('/public', serve(path.join(__dirname,'../dist'))));


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
    '3iD_genPFP': {
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
    'describe': {},
};

// Accepts a blockchain account to generate a unique PFP.
//
// Properties are generated per account and saved; will check if a
// property has already been generated.
jsonrpc.method('3iD_genPFP', async (ctx, next) => {
    const params = METHOD_PARAMS['3iD_genPFP'];
    // ctx.jsonrpc available
    /*
        ctx.jsonrpc.request
        ctx.jsonrpc.id
        ctx.jsonrpc.method [[Get]]
        ctx.jsonrpc.params [[Get]]
        ctx.jsonrpc.response
        ctx.jsonrpc.result
        ctx.jsonrpc.error
        ctx.jsonrpc.code
        ctx.jsonrpc.message
        ctx.jsonrpc.data
    */
    if (!ctx.storage) {
        ctx.throw(500, 'missing storage API key');
    }

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

    const genTraits = generateTraits(100, 60, 20);
    const colors = Object.keys(genTraits).map((k) => genTraits[k].value);

    const gradient = new canvas(new fabric.StaticCanvas(null, { width: 1500, height: 500}), colors);
    gradient.animate();
    // NB: freeze() returns a Data URL by default; pass true to get a binary blob.
    const imageFormat = "image/png";
    const stream = await gradient.freeze(true, imageFormat);
    const blob = await streamToBlob(stream, imageFormat);
    const png = new storage.File([blob], "threeid.png", {type: imageFormat});

    // Upload to NFT.storage.
    const metadata = await ctx.storage.store({
        name: `3iD`,
        description: `3iD PFP for ${account}`,
        image: png,
        properties: {
            account,
            blockchain,
            traits: genTraits,
        },
    });
    console.log('IPFS URL for the metadata:', metadata.url);
    console.log('metadata.json contents:\n', metadata.data);
    console.log(
        'metadata.json contents with IPFS gateway URLs:\n',
        metadata.embed()
    );

    // const reader = 
    ctx.body = jsonrpc.methods.map(method => {
        return {
            blob,
            png,

        }
    })

    // TODO: request contracts from alchemy

});



jsonrpc.method('describe', (ctx, next) => {
    ctx.body = jsonrpc.methods.map(method => {
        return {
            name: method,
            params: METHOD_PARAMS[method] || {}
        };
    });
});

// TODO: images generated by blockchain addresses have inputs stored in REDIS with TTL.
// user is prompted to claim their core to claim their image. We should check if this
// account is holding a token and if so, return the image.
// TODO: another endpoint where the uri is the token id and the image is returned.
async function example(ctx) {
    const params = METHOD_PARAMS['3iD_genPFP'];

    const blockchain = ctx.params['blockchain'];
    if (!params.blockchain.properties.name.enum.includes(blockchain)) {
        ctx.throw(401, `${blockchain.name} is not a valid blockchain. Valid blockchains are: ${params.blockchain.properties.name.enum.join(', ')}.`);
    }

    // eth only atm
    const account = ctx.params['account'];
    if (blockchain == CHAINS.ETH && !Web3.utils.isAddress(account)) {
        ctx.throw(401, 'account is not a valid address');
    }

    // TODO: check if account has a token and fetch the image
    const hasToken = false;
    // TODO: check if account has alraedy genearted an image and fetch the image
    const hasImage = false;


    const response = {
        account,
    };

    if (!hasImage) {
        const genTraits = generateTraits(100, 60, 20);
        response.traits = genTraits;

        // TODO: upload to NFT.storage
    }

    await ctx.render('nftar', response);
};

router.post('/api', jsonrpc.middleware);
router.get('/:blockchain/:account', example);

const render = views(__dirname + '/views', { map: { html: 'nunjucks' }});

app.use(render);
app.use(logger());
app.use(router.routes());


module.exports = app;
