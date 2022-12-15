export interface Environment {
  Bucket: R2Bucket
  Meta: DurableObjectNamespace
}

export interface IndexRecord {
  version: number
  visibility: string
}

export type ObjectValue = boolean | string | object | number | null | undefined

export enum Visibility {
  PRIVATE = 'private',
  PUBLIC = 'public',
}

export type GetObjectParams = [namespace: string, path: string]

export type GetObjectResult = {
  value: ObjectValue
  version: number
}

export type PutObjectOptions = Partial<{
  visibility: Visibility
}>

export type PutObjectParams = [
  namespace: string,
  path: string,
  value: ObjectValue,
  options?: PutObjectOptions
]

export type PutObjectResult = {
  size: number
  version: number
}
