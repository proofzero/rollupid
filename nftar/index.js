// nftar/index.js

const http = require('http');
const process = require('process');
const app = require ('./src/app');
const storage = require('nft.storage');

// Inject client for our storage service into the context. We read the
// API key for the service from the environment variable STORAGE_KEY.
//
// NB: app.context is the prototype from which the request ctx is
// created.
app.context.storage = new storage.NFTStorage({
    token: process.env.STORAGE_KEY,
});

// The port to listen on.
const port = parseInt(process.env.PORT) || 3000;

http.createServer(app.callback()).listen(port);
