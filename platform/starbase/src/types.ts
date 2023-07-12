import { z } from 'zod'
import { EdgeSpace, EdgeURN } from '@proofzero/urns/edge'
import {
  AllFieldsSchema,
  AppClientIdParamSchema,
  AppInternalFieldSchema,
  AppObjectSchema,
  AppReadableFieldsSchema,
  AppUpdateableFieldsSchema,
} from './jsonrpc/validators/app'

import {
  CustomDomainDNSRecordsSchema,
  CustomDomainSchema,
} from './jsonrpc/validators/customdomain'

import {
  GetAuthorizedAccountsMethodInput,
  GetAuthorizedAccountsMethodOutput,
  AuthorizedUser,
} from './jsonrpc/methods/getAuthorizedAccounts'
import { DeploymentMetadata } from '@proofzero/types'
import { EdgesMetadata } from '../../edges/src/jsonrpc/validators/edge'

export interface Environment {
  Analytics: AnalyticsEngineDataset
  ServiceDeploymentMetadata: DeploymentMetadata
  StarbaseApp: DurableObjectNamespace
  Edges: Fetcher
  INTERNAL_PASSPORT_SERVICE_NAME: string
  INTERNAL_CLOUDFLARE_ZONE_ID: string
  TOKEN_CLOUDFLARE_API: string
  INTERNAL_DKIM_SELECTOR: string
  SECRET_POSTHOG_API_KEY: string
}

export const EDGE_APPLICATION: EdgeURN = EdgeSpace.urn('owns/app')

export type AppUpdateableFields = z.infer<typeof AppUpdateableFieldsSchema>
export type AppReadableFields = z.infer<typeof AppReadableFieldsSchema>
export type AppInternalField = z.infer<typeof AppInternalFieldSchema>
export type AppAllFields = z.infer<typeof AllFieldsSchema>
export type AppClientIdParam = z.infer<typeof AppClientIdParamSchema>
export type AppObject = z.infer<typeof AppObjectSchema>

export type AuthorizedAccountsParams = z.infer<
  typeof GetAuthorizedAccountsMethodInput
>
export type AuthorizedAccountsOutput = z.infer<
  typeof GetAuthorizedAccountsMethodOutput
>
export type AuthorizedUser = z.infer<typeof AuthorizedUser>
export type EdgesMetadata = z.infer<typeof EdgesMetadata>

export type CustomDomain = z.infer<typeof CustomDomainSchema>
export type CustomDomainDNSRecords = z.infer<
  typeof CustomDomainDNSRecordsSchema
>
