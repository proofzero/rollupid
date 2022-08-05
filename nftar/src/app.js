const Koa     = require('koa');
const logger = require('koa-logger')
const Router     = require('koa-router');
const bodyParser = require('koa-bodyparser');
const Jsonrpc    = require('@koalex/koa-json-rpc');
const fabric     = require('fabric').fabric;
const views = require('koa-views');
const mount = require('koa-mount');
const serve = require('koa-better-serve')
const path = require('path');
const Web3 = require('web3');

const Probability = require('./probability.js')
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
}

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
}

// acceptes a blockchain account to genearte a unique PFP
// properties are generated per account and saved
// will check if a properties hae already been to genearted
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
    const colors = Object.keys(genTraits).map((k) => genTraits[k].value.rgb)
    
    const gradient = new canvas(new fabric.Canvas('c'), colors);
    gradient.animate();
    const png = await gradient.freeze()

    ctx.body = {
        account,
        blockchain,
        pfpProperties: genTraits,
        image: {
            cid: "abc123",
            "content-type": "image/png",
            // "base64": png,
        }
    }
});



jsonrpc.method('describe', (ctx, next) => {
    ctx.body = jsonrpc.methods.map(method => {
        return {
            name: method,
            params: METHOD_PARAMS[method] || {}
        }
    });
});

async function example(ctx) {
    const genTraits = generateTraits(100, 60, 20);
    // const colors = Object.keys(genTraits).map((k) => genTraits[k].value.rgb)

    await ctx.render('nftar', {
        account: ctx.params.account,
        // colors: JSON.stringify(colors)
        traits: genTraits,
     });
};

router.post('/api', jsonrpc.middleware);
router.get('/:account', example);

const render = views(__dirname + '/views', { map: {html: 'nunjucks' }})

app.use(render);
app.use(logger());
app.use(router.routes());


module.exports = app;

