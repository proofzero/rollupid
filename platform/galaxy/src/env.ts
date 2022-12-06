export default interface Env {
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  // MY_KV_NAMESPACE: KVNamespace;
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;

  Oort: Fetcher
  Account: Fetcher
  Address: Fetcher
  Icons: Fetcher
  ALCHEMY_GOERLI_KEY: string
  ALCHEMY_POLYGON_TESTNET_KEY: string
  ALCHEMY_ETH_MAINNET_KEY: string
  ALCHEMY_POLYGON_MAINNET_KEY: string
  ALCHEMY_ETH_CHAIN: string
  ALCHEMY_POLYGON_CHAIN: string
  ALCHEMY_GOERLI_NETWORK: string
  ALCHEMY_POLYGON_TEST_NETWORK: string
  ALCHEMY_ETH_NETWORK: string
  ALCHEMY_POLYGON_NETWORK: string
}

export const required = [
  'Oort',
  'Account',
  'Address',
  'Icons',
  'ALCHEMY_GOERLI_KEY',
  'ALCHEMY_POLYGON_TESTNET_KEY',
  'ALCHEMY_POLYGON_MAINNET_KEY',
  'ALCHEMY_ETH_MAINNET_KEY',
  'ALCHEMY_ETH_CHAIN',
  'ALCHEMY_POLYGON_CHAIN',
  'ALCHEMY_GOERLI_NETWORK',
  'ALCHEMY_POLYGON_TEST_NETWORK',
  'ALCHEMY_ETH_NETWORK',
  'ALCHEMY_POLYGON_NETWORK',
]
