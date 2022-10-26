export type StorageValue = boolean | number | string | object

export type Entity = {
  namespace: string
  path: string
  value: StorageValue
}

export type GetParams = [string, string]
export type GetResult = Entity

export type SetParams = [string, string, StorageValue]
export type SetResult = Entity
