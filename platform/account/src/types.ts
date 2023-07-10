import { z } from 'zod'
import { AddressListSchema } from './jsonrpc/validators/addressList'
import { ProfileSchema } from './jsonrpc/validators/profile'
import { DeploymentMetadata } from '@proofzero/types'
import { AddressesSchema } from './jsonrpc/validators/profile'

export interface Environment {
  Account: DurableObjectNamespace
  IdentityGroup: DurableObjectNamespace
  Edges: Fetcher
  Analytics: AnalyticsEngineDataset
  ServiceDeploymentMetadata: DeploymentMetadata
}

// TODO: move to types packages
export type AddressList = z.infer<typeof AddressListSchema>
export type Profile = z.infer<typeof ProfileSchema>
export type Addresses = z.infer<typeof AddressesSchema>
