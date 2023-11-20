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
  GetAuthorizedIdentitiesMethodInput,
  GetAuthorizedIdentitiesMethodOutput,
  AuthorizedUser,
} from './jsonrpc/methods/getAuthorizedIdentities'
import { EdgesMetadata } from '../../edges/src/jsonrpc/validators/edge'
import { ExternalDataPackageDefinitionSchema } from './jsonrpc/validators/externalDataPackage'

export const EDGE_APPLICATION: EdgeURN = EdgeSpace.urn('owns/app')

export type AppUpdateableFields = z.infer<typeof AppUpdateableFieldsSchema>
export type AppReadableFields = z.infer<typeof AppReadableFieldsSchema>
export type AppInternalField = z.infer<typeof AppInternalFieldSchema>
export type AppAllFields = z.infer<typeof AllFieldsSchema>
export type AppClientIdParam = z.infer<typeof AppClientIdParamSchema>
export type AppObject = z.infer<typeof AppObjectSchema>

export type AuthorizedIdentitiesParams = z.infer<
  typeof GetAuthorizedIdentitiesMethodInput
>
export type AuthorizedIdentitiesOutput = z.infer<
  typeof GetAuthorizedIdentitiesMethodOutput
>
export type AuthorizedUser = z.infer<typeof AuthorizedUser>
export type EdgesMetadata = z.infer<typeof EdgesMetadata>

export type CustomDomain = z.infer<typeof CustomDomainSchema>
export type CustomDomainDNSRecords = z.infer<
  typeof CustomDomainDNSRecordsSchema
>

export type ExternalDataPackageDefinition = z.infer<
  typeof ExternalDataPackageDefinitionSchema
>
