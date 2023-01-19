import { z } from 'zod'
import { AddressListSchema } from './jsonrpc/validators/addressList'
import { ProfileSchema } from './jsonrpc/validators/profile'
import { DeploymentMetadata } from '@kubelt/types'

export interface Environment {
  Account: DurableObjectNamespace
  Edges: Fetcher
  Analytics: AnalyticsEngineDataset
  ServiceDeploymentMetadata: DeploymentMetadata
}

export type AddressList = z.infer<typeof AddressListSchema>

// TODO: move to types packages
export type Profile = z.infer<typeof ProfileSchema>
