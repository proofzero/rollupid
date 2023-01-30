import { z } from 'zod'
import { AddressListSchema } from './jsonrpc/validators/addressList'
import {
  ProfileSchema,
  LinksSchema,
  GallerySchema,
} from './jsonrpc/validators/profile'
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
export type Links = z.infer<typeof LinksSchema>
export type Gallery = z.infer<typeof GallerySchema>
export type Addresses = z.infer<typeof AddressListSchema>
