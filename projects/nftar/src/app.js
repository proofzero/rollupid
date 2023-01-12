// nftar/src/app.js

const { Blob } = require('node:buffer')
global.Blob = Blob

const fs = require('fs')
const path = require('path')
const cheerio = require('cheerio')

const Koa = require('koa')
const logger = require('koa-logger')
const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')
const Jsonrpc = require('@koalex/koa-json-rpc')
const streamToBlob = require('stream-to-blob')
const fabric = require('fabric').fabric
const storage = require('nft.storage')
const Web3 = require('web3')

const {
  calculateNFTWeight,
  calculateSpecialWeight,
  calculateBalanceWeight,
  generateTraits,
  uploadImage,
  generateOGImage,
  generateOGImageFromBuffers,
} = require('./utils.js')

const { getContractAddresses } = require('./traits.js')

const canvas = require('./canvas/canvas.js')

const app = new Koa()
app.use(bodyParser())

const router = new Router()

const jsonrpc = new Jsonrpc({
  bodyParser: bodyParser({
    onerror: (err, ctx) => {
      ctx.status = 200
      ctx.body = Jsonrpc.parseError
    },
  }),
})

const CHAINS = {
  ETH: 'ethereum',
}

// TODO: is there a better way to do this? e.g., open API yaml?
const METHOD_PARAMS = {
  '3id_genPFP': {
    account: {
      type: 'string',
      description: 'blockchain account used to genearate the PFP',
    },
    blockchain: {
      type: 'object',
      description: 'which blockchain this account belongs to',
      properties: {
        name: {
          type: 'string',
          description: 'name of the blockchain',
          enum: [CHAINS.ETH],
        },
        chainId: {
          type: 'number',
          description: 'chain id of the blockchain',
        },
      },
    },
  },
  describe: {},
}

// Accepts a blockchain account to generate a unique PFP.
//
// Properties are generated per account and saved; will check if a
// property has already been generated.
jsonrpc.method('3id_genPFP', async (ctx, next) => {
  const s0 = performance.now()
  const key = ctx.request.headers.authorization
    ? ctx.request.headers.authorization.replace('Bearer ', '')
    : null

  if (ctx.apiKey && !key) {
    ctx.throw(403, 'Missing NFTAR API key')
  }
  if (key !== ctx.apiKey && key !== ctx.devKey) {
    ctx.throw(401, 'Invalid NFTAR API key')
  }
  const params = METHOD_PARAMS['3id_genPFP']

  const account = ctx.jsonrpc.params['account']
  if (!account) {
    ctx.throw(401, 'account is required')
  }

  const blockchain = ctx.jsonrpc.params['blockchain']
  if (!blockchain) {
    ctx.throw(401, 'blockchain is required')
  } else if (
    !params.blockchain.properties.name.enum.includes(blockchain.name)
  ) {
    ctx.throw(
      401,
      `${
        blockchain.name
      } is not a valid blockchain. Valid blockchains are: ${params.blockchain.properties.name.enum.join(
        ', '
      )}.`
    )
  }

  // eth only atm
  if (blockchain.name == CHAINS.ETH && !Web3.utils.isAddress(account)) {
    ctx.throw(401, 'account is not a valid address')
  }

  // Validate Cloudflare config.
  if (
    !ctx.cloudflare ||
    !ctx.cloudflare.r2 ||
    !ctx.cloudflare.r2.bucket ||
    !ctx.cloudflare.r2.endpoint ||
    !ctx.cloudflare.r2.publicURL ||
    !ctx.cloudflare.r2.customDomain ||
    !ctx.cloudflare.r2.accessKeyId ||
    !ctx.cloudflare.r2.secretAccessKey
  ) {
    ctx.throw(500, 'Missing storage service configuration')
  }

  // Clone the R2 config so we can access it when ctx is no longer available in fire-and-forget requests.
  const r2Config = JSON.parse(JSON.stringify(ctx.cloudflare.r2))

  // derive weight inc for each trait
  let t0, t1
  const weightInc = {}
  t0 = performance.now()

  // Alchemy accepts a maximum of 20 contracts.
  // cf. https://docs.alchemy.com/reference/sdk-getnfts
  const MAX_ALCHEMY_CONTRACT_ARRAY_SIZE = 20
  const contractAddresses = getContractAddresses().slice(
    0,
    MAX_ALCHEMY_CONTRACT_ARRAY_SIZE
  )

  const nftsForOwner = await ctx.alchemy.nft.getNftsForOwner(account, {
    contractAddresses,
  })

  t1 = performance.now()
  console.log(`Call to alchemy took ${t1 - t0} milliseconds.`)

  // If the client wants us to check Alchemy to see if the NFT has been
  // minted, but has the image and wants to skip expensive operations, it
  // sends a queryparam called 'skipImage' set to true.
  const skipImage =
    new URL(ctx.request.href).searchParams.get('skipImage') === 'true'
  if (skipImage) {
    ctx.body = {
      skipImage,
    }
    const s1 = performance.now()
    console.log(`Total took ${s1 - s0} milliseconds.`)
    return
  }

  // TRAIT ONE: POPULAR COLLECTIONS
  weightInc['trait1'] = calculateNFTWeight(nftsForOwner.ownedNfts)

  // TRAIT TWO: SPECIAL COLLECTIONS
  weightInc['trait2'] = calculateSpecialWeight(nftsForOwner.ownedNfts)

  // TRAIT THREE: WALLET BALLANCE
  t0 = performance.now()
  const balanceWei = await ctx.web3.eth.getBalance(account)
  const balanceEth = ctx.web3.utils.fromWei(balanceWei, 'ether')
  weightInc['trait3'] = calculateBalanceWeight(balanceEth)
  t1 = performance.now()
  console.log(`Call to getBalance took ${t1 - t0} milliseconds.`)

  t0 = performance.now()
  const genTraits = generateTraits(weightInc)
  const colors = Object.keys(genTraits).map((k) => genTraits[k].value)
  t1 = performance.now()
  console.log(`Call to generateTraits took ${t1 - t0} milliseconds.`)

  const isNode = () => typeof window === 'undefined'

  const PFP_SQUARE_DIMENSION = 500
  const PFP_WIDTH = PFP_SQUARE_DIMENSION
  const PFP_HEIGHT = PFP_SQUARE_DIMENSION

  const pfp_gradient = new canvas(
    new fabric.StaticCanvas(null, { width: PFP_WIDTH, height: PFP_HEIGHT }),
    colors
  )

  // We make a double-width version with the same color seeds for the cover image.
  t0 = performance.now()
  const cvr_gradient = new canvas(
    new fabric.StaticCanvas(null, { width: PFP_WIDTH * 2, height: PFP_HEIGHT }),
    colors
  )

  let pfp_stream
  let cvr_stream

  if (isNode()) {
    // Generate a single frame; call animate() to produce an animation.
    pfp_stream = pfp_gradient.snapshot()
    cvr_stream = cvr_gradient.snapshot()
  } else {
    // NB: freeze() returns a Data URL.
    pfp_stream = await pfp_gradient.freeze()
    cvr_stream = await cvr_gradient.freeze()
  }

  const imageFormat = 'image/png'
  //const htmlFormat = "text/html";

  const pfp_blob = await streamToBlob(pfp_stream, imageFormat)
  const cvr_blob = await streamToBlob(cvr_stream, imageFormat)
  //const ani_blob = animationViewer(account, genTraits);
  t1 = performance.now()
  console.log(`Generating image took ${t1 - t0} milliseconds.`)

  // nft.storage File objects are automatically uploaded with the carfile below.
  t0 = performance.now()
  const png = new storage.File([pfp_blob], 'image.png', { type: imageFormat })
  const cvr = new storage.File([cvr_blob], 'cover.png', { type: imageFormat })
  //const ani = new storage.File([ani_blob], "index.html", {type: htmlFormat});
  t1 = performance.now()
  console.log(`File blobbing took ${t1 - t0} milliseconds.`)

  // Put the account in the metadata object so it's not a trait.
  blockchain.account = account

  const nft = {
    name: `3ID PFP: GEN 0`,
    description: `3ID PFP for ${account}`,
    image: png,
    cover: cvr,
    external_url: `https://my.threeid.xyz/${account}`,
    //animation_url: ani,
    properties: {
      metadata: blockchain,
      traits: genTraits,
      GEN: genTraits.trait0.value.name,
      Priority: genTraits.trait1.value.name,
      Friend: genTraits.trait2.value.name,
      Points: genTraits.trait3.value.name,
    },
  }

  t0 = performance.now()
  const { token, car } = await storage.NFTStorage.encodeNFT(nft)
  const metadata = token
  const opts = {}

  // Fire-and-forget uploads.
  let u0, u1, u2, cid
  u0 = performance.now()
  ctx.storage
    .storeCar(car, opts)
    .then((_cid) => {
      cid = _cid
      u1 = performance.now()
      console.log(`NFT.storage took ${u1 - u0} milliseconds for ${cid}.`)
    })
    .then(() =>
      fetch(`https://nftstorage.link/ipfs/${metadata.ipnft}/metadata.json`)
    )
    .then(() => {
      u2 = performance.now()
      console.log(`Warming fires took ${u2 - u1} milliseconds for ${cid}`)
    })
    .catch((e) => {
      u2 = performance.now()
      console.log(
        `Fire-and-forget store-and-warm failed in ${
          u2 - u1
        } milliseconds for ${cid} with:`,
        JSON.stringify(e)
      )
    })
    .finally(() =>
      console.log(
        `NFT.storage store-and-warm took ${
          u2 - u0
        } milliseconds for ${cid} end-to-end.`
      )
    )
  t1 = performance.now()
  console.log(
    `NFT.storage metadata generation and upload scheduling took ${
      t1 - t0
    } milliseconds.`
  )

  t0 = performance.now()
  let v0 = t0

  const imageFilepath = `${metadata.ipnft}/image.png`
  const coverFilepath = `${metadata.ipnft}/cover.png`

  const imageURL = `${r2Config.publicURL}${imageFilepath}`
  const coverURL = `${r2Config.publicURL}${coverFilepath}`

  const ogFilename = `${Web3.utils.keccak256(coverURL + imageURL)}/og.png`

  const imageBuffer = Buffer.from(await pfp_blob.arrayBuffer())
  const coverBuffer = Buffer.from(await pfp_blob.arrayBuffer())

  // Fire-and-forget uploads to R2.
  Promise.all([
    uploadImage(r2Config, imageFilepath, imageBuffer, imageFormat),
    uploadImage(r2Config, coverFilepath, coverBuffer, imageFormat),
  ])
    // Actually can't fire-and-forget OG generation because Cloud Run won't let Puppeteer run in the background.
    // .then(() => generateOGImageFromBuffers(r2Config, coverBuffer, imageBuffer, ogFilename))
    .then(() =>
      console.log(
        `Completing Cloudflare R2 uploads actually took ${
          performance.now() - v0
        } milliseconds.`
      )
    )

  t1 = performance.now()
  console.log(`Scheduling Cloudflare R2 uploads took ${t1 - t0} milliseconds.`)

  // This is the URI that will be passed to the NFT minting contract.
  const tokenURI = metadata.url

  // Generate signed voucher using ctx.wallet.
  const voucher = {
    recipient: account,
    uri: tokenURI,
  }

  // In Solidity this is equivalent to...
  // `keccak256(abi.encodePacked(voucher.account, voucher.tokenURI))`
  // ... which is the hash we want to replicate for signer recovery.
  t0 = performance.now()
  const packedHash = ctx.web3.utils.soliditySha3(
    {
      type: 'address',
      value: voucher.recipient,
    },
    {
      type: 'string',
      value: voucher.uri,
    }
  )

  // NB: A signed message is prefixed with "\x19Ethereum Signed
  // Message:\n" and the length of the message, using the hashMessage
  // method, so that it is EIP-191 compliant. If recovering the
  // address in Solidity, this prefix will be required to create a
  // matching hash.
  const signature = await ctx.wallet.sign(packedHash)

  // The smart contract expects the signature as part of the voucher
  // so we add it here to make integrations as easy as possible.
  voucher.signature = signature.signature
  t1 = performance.now()
  console.log(`Crypto took ${t1 - t0} milliseconds.`)

  // Generate the response to send to the client.
  const body = {
    metadata: metadata.data,
    voucher,
    signature,
  }

  // The voucher stores the IPFS URIs, these are the faster Cloudflare URLs
  // that should be passed back to the OG:Image generator and other services.
  body.metadata.image = imageURL
  body.metadata.cover = coverURL

  // TODO: Is it useful to return the OG image URL here? If so, this needs a fix.
  //body.metadata.ogImage = `${r2Config.publicURL}${ogFilename}`;

  ctx.body = body
  console.log(`Total took ${performance.now() - s0} milliseconds.`)
})

jsonrpc.method('describe', (ctx, next) => {
  ctx.body = jsonrpc.methods.map((method) => {
    return {
      name: method,
      params: METHOD_PARAMS[method] || {},
    }
  })
})

router.post('/api', jsonrpc.middleware)

// REST handler for op-image verification.
router.post('/api/v0/og-image', async (ctx, next) => {
  const key = ctx.request.headers.authorization
    ? ctx.request.headers.authorization.replace('Bearer ', '')
    : null

  if (ctx.apiKey && !key) {
    ctx.throw(403, 'Missing NFTAR API key')
  }

  if (key !== ctx.apiKey && key !== ctx.devKey) {
    ctx.throw(401, 'Invalid NFTAR API key')
  }

  if (
    !ctx.cloudflare ||
    !ctx.cloudflare.r2 ||
    !ctx.cloudflare.r2.bucket ||
    !ctx.cloudflare.r2.endpoint ||
    !ctx.cloudflare.r2.publicURL ||
    !ctx.cloudflare.r2.customDomain ||
    !ctx.cloudflare.r2.accessKeyId ||
    !ctx.cloudflare.r2.secretAccessKey
  ) {
    ctx.throw(500, 'Missing storage service configuration')
  }

  // Clone the R2 config so we can access it when ctx is no longer available in fire-and-forget requests.
  const r2Config = JSON.parse(JSON.stringify(ctx.cloudflare.r2))

  const bkg = ctx.request.body.bkg
  const hex = ctx.request.body.hex

  if (!bkg || !hex) {
    ctx.throw(500, 'Missing bkg or hex parameter')
  }

  let bkgURL, hexURL

  // Validate that we've been passed well-formed URLs.
  try {
    bkgURL = new URL(ctx.request.body.bkg)
    hexURL = new URL(ctx.request.body.hex)
  } catch (e) {
    ctx.throw(500, 'Malformed bkg or hex parameter')
  }

  // NOTE: Unique cache key (big assumption here that the passed image urls are, themselves, unique).
  const filename = `${Web3.utils.keccak256(bkgURL.href + hexURL.href)}/og.png`

  // Check the image service to see if the cache key already exists.
  const url = `${r2Config.publicURL}${filename}`
  const customDomainURL = `${r2Config.customDomain}${filename}`
  console.log('Checking cache:', url, 'for', customDomainURL)
  const cacheCheck = await fetch(url)

  if (cacheCheck.status === 200) {
    console.log('Returning cached image url for ', filename)
    ctx.set('Content-Type', 'application/json')
    ctx.body = { url: customDomainURL }
  } else if (cacheCheck.status === 404) {
    console.log(`Cache miss for ${filename}. Generating new image.`)

    await generateOGImage(r2Config, bkgURL, hexURL, filename)

    ctx.set('Content-Type', 'application/json')
    ctx.body = { url: customDomainURL }
  } else {
    ctx.set('Content-Type', 'application/json')
    ctx.status = 500
    ctx.body = `{ "err": "Application Error: Image Service returned bad non-200, non-404 response '${cacheCheck.status}' for ${filename} (search for this in logs)." }`
    console.log(filename, JSON.stringify(cacheCheck))
  }

  return next()
})

app.use(logger())
app.use(router.routes())

module.exports = app
