export const getBaseKey = (namespace: string, path: string): string => {
  return `${namespace}.${path}`
}

export const getIndexKey = (pathKey: string): string => {
  return `objects/${pathKey}`
}

export const getObjectKey = (
  coreId: string,
  pathKey: string,
  version: number
): string => {
  return `${coreId}.${pathKey}.${version}`
}
