import { BaseApi } from '@kubelt/platform.commons/src/jsonrpc'

export interface Environment {
  Address: Fetcher
  Core: DurableObjectNamespace
  Objects: R2Bucket
}

export interface IndexRecord {
  version: number
  visibility: string
}

export type ObjectValue = boolean | string | object | number | null | undefined

export type VisibilityType = {
  [key: string]: string
}

export type GetObjectOptions = Record<string, unknown>

export type GetObjectResult = {
  value: ObjectValue
  version: number
}

export type PutObjectOptions = {
  visibility: string
}

export type PutObjectResult = {
  size: number
  version: number
}

export interface Api extends BaseApi {
  kb_getObject(
    namespace: string,
    path: string,
    options: GetObjectOptions
  ): Promise<GetObjectResult>
  kb_putObject(
    namespace: string,
    path: string,
    value: ObjectValue,
    options: PutObjectOptions
  ): Promise<PutObjectResult>
}
