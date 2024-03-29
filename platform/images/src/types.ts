import { DeploymentMetadata } from '@proofzero/types'

export interface Environment {
  Images: DurableObjectNamespace
  Analytics: AnalyticsEngineDataset
  ServiceDeploymentMetadata: DeploymentMetadata
  TOKEN_CLOUDFLARE_API: string
  INTERNAL_CLOUDFLARE_ACCOUNT_ID: string
  HASH_INTERNAL_CLOUDFLARE_ACCOUNT_ID: string
  UPLOAD_WINDOW_SECONDS: number
}
