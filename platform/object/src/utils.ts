export const getBaseKey = (namespace: string, path: string): string => {
  return `${namespace}.${path}`
}

export const getIndexKey = (pathKey: string): string => {
  return `objects/${pathKey}`
}

export const getObjectBaseKey = (coreId: string, pathKey: string): string => {
  return `${coreId}.${pathKey}`
}

export const getObjectKey = (
  coreId: string,
  pathKey: string,
  version: number
): string => {
  return `${getObjectBaseKey(coreId, pathKey)}.${version}`
}

export const getObjectVersionFromKey = (key: string): number => {
  return Number(key.split('.').pop())
}
