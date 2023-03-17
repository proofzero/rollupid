import { DeploymentMetadata } from '@proofzero/types'

export interface Environment {
  Analytics: AnalyticsEngineDataset
  ServiceDeploymentMetadata: DeploymentMetadata
  ENVIRONMENT: string
  EDGES: D1Database
}
