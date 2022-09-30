// nftar/index.js

// Load environment variables from .env file.
require('dotenv').config();

const app = require('./src/app');
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const {
    Alchemy,
    Network,
} = require('alchemy-sdk');
const http = require('http');
const process = require('process');
const storage = require('nft.storage');

const main = async (api) => {
    // Inject client for our storage service into the context. We read the
    // API key for the service from the environment variable STORAGE_KEY.
    //
    // NB: app.context is the prototype from which the request ctx is
    // created.
    api.context.storage = new storage.NFTStorage({
        token: process.env.STORAGE_KEY,
    });

    // Import the wallet as a mnemonic. Assumes the default Ethereum
    // path and standard English wordlist.
    // const mnemonic = process.env.WALLET_MNEMONIC;
    // api.context.wallet = await ethers.Wallet.fromMnemonic(mnemonic);
    const web3 = new createAlchemyWeb3(process.env.ALCHEMY_URL);
    api.context.web3 = web3;
    api.context.wallet = web3.eth.accounts.privateKeyToAccount(process.env.WALLET_PRIVATE_KEY);

    // An Alchemy API client.
    api.context.alchemy = new Alchemy({
        apiKey: process.env.ALCHEMY_API_KEY,
        network: Network[process.env.ALCHEMY_NETWORK],
        maxRetries: 10,
    });

    // The Ethereum minting contract address.
    api.context.contract = process.env.CONTRACT_ADDRESS;
    api.context.pfp_contract = process.env.PFP_CONTRACT_ADDRESS;
    api.context.invite_contract = process.env.INVITE_CONTRACT_ADDRESS;

    // set the app api key
    api.context.apiKey = process.env.NFTAR_API_KEY;

    // This key, if set, will allow the caller to bypass the 409 error thrown
    // when requesting generation of a PFP that already exists. For testing.
    api.context.devKey = process.env.NFTAR_DEV_KEY;

    // The port to listen on.
    const port = parseInt(process.env.PORT) || 3000;

    return { api, port };
};

(async () => {
    const { api, port } = await main(app);
    http.createServer(api.callback()).listen(port);
})();
