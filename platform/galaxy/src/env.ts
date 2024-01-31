import { DeploymentMetadata } from '@proofzero/types'

export default interface Env {
  Analytics: AnalyticsEngineDataset
  ServiceDeploymentMetadata: DeploymentMetadata
  Core: Fetcher
}

export const required = ['Core']
