import { DeploymentMetadata } from '@proofzero/types'

export default interface Env {
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  // MY_KV_NAMESPACE: KVNamespace;
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;
  Analytics: AnalyticsEngineDataset
  ServiceDeploymentMetadata: DeploymentMetadata
  Account: Fetcher
  Address: Fetcher
  Starbase: Fetcher
  Access: Fetcher
  JWKS_INTERNAL_URL_BASE: string
}

export const required = ['Account', 'Address', 'Starbase', 'Access']
