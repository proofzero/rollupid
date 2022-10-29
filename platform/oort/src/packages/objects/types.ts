export interface IndexRecord {
  version: number
  visibility: string
}

export type ObjectValue = boolean | string | object | number | null | undefined

export type GetObjectOptions = Record<string, unknown>

export type GetObjectParams = [string, string, GetObjectOptions]
export type GetObjectResult = {
  value: ObjectValue
  version: number
}

export type PutObjectOptions = {
  visibility: string
}

export type PutObjectParams = [string, string, object, PutObjectOptions]
export type PutObjectResult = {
  size: number
  version: number
}
