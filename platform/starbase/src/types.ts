import { z } from 'zod'
import { EdgeSpace, EdgeURN } from '@kubelt/urns/edge'
import {
  AllFieldsSchema,
  AppClientIdParamSchema,
  AppInternalFieldSchema,
  AppObjectSchema,
  AppReadableFieldsSchema,
  AppUpdateableFieldsSchema,
  ScopeMeta,
} from './jsonrpc/validators/app'
import { DeploymentMetadata } from '@kubelt/types'

export interface Environment {
  Analytics: AnalyticsEngineDataset
  ServiceDeploymentMetadata: DeploymentMetadata
  StarbaseApp: DurableObjectNamespace
  Edges: Fetcher
}

export const EDGE_APPLICATION: EdgeURN = EdgeSpace.urn('owns/app')

export type AppUpdateableFields = z.infer<typeof AppUpdateableFieldsSchema>
export type AppReadableFields = z.infer<typeof AppReadableFieldsSchema>
export type AppInternalField = z.infer<typeof AppInternalFieldSchema>
export type AppAllFields = z.infer<typeof AllFieldsSchema>
export type AppClientIdParam = z.infer<typeof AppClientIdParamSchema>
export type AppObject = z.infer<typeof AppObjectSchema>
export type ScopeMeta = z.infer<typeof ScopeMeta>
