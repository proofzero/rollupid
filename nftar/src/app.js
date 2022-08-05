const Koa     = require('koa');
const logger = require('koa-logger')
const Router     = require('koa-router');
const bodyParser = require('koa-bodyparser');
const Jsonrpc    = require('@koalex/koa-json-rpc');
const fabric     = require('fabric');
const views = require('koa-views');
const JSONStream = require('streaming-json-stringify');
const mount = require('koa-mount');
const serve = require('koa-better-serve')
const path = require('path');

const gradient = require('./canvas/canvas.js');

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


jsonrpc.method('3iD_genPFP', (ctx, next) => {
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
    ctx.body = 'Hello world!';
});

jsonrpc.method('describe', (ctx, next) => {
    ctx.body = jsonrpc.methods;
});

async function example(ctx) {
    await ctx.render('nftar', { });
};

router.post('/api', jsonrpc.middleware);
router.get('/', example);

const render = views(__dirname + '/views', { map: {html: 'nunjucks' }})

app.use(render);
app.use(logger());
app.use(router.routes());


module.exports = app;

