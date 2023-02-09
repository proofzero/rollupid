import {
  AccountURNInput,
  ApplicationURNInput,
} from '@kubelt/platform-middleware/inputValidators'
import { DeploymentMetadata } from '@kubelt/types'
import z from 'zod'

export interface Environment {
  Images: DurableObjectNamespace
  Analytics: AnalyticsEngineDataset
  ServiceDeploymentMetadata: DeploymentMetadata
  TOKEN_CLOUDFLARE_API: string
  INTERNAL_CLOUDFLARE_ACCOUNT_ID: string
  HASH_INTERNAL_CLOUDFLARE_ACCOUNT_ID: string
  UPLOAD_WINDOW_SECONDS: number
}

export const AccountOrApplicationURNSchema =
  AccountURNInput.or(ApplicationURNInput)
export type AccountOrApplicationURN = z.infer<
  typeof AccountOrApplicationURNSchema
>
