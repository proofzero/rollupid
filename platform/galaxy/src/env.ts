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
  ALCHEMY_ETH_KEY: string
  ALCHEMY_ETH_NETWORK: string
  ALCHEMY_POLYGON_KEY: string
  ALCHEMY_POLYGON_NETWORK: string
}

export const required = [
  'Oort',
  'Account',
  'Address',
  'Icons',
  'ALCHEMY_ETH_KEY',
  'ALCHEMY_ETH_NETWORK',
  'ALCHEMY_POLYGON_KEY',
  'ALCHEMY_POLYGON_NETWORK',
]
