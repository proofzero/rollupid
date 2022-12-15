export const getBaseKey = (namespace: string, path: string): string => {
  return `${namespace}.${path}`
}

export const getObjectBaseKey = (metaId: string, pathKey: string): string => {
  return `${metaId}.${pathKey}`
}

export const getObjectKey = (
  metaId: string,
  pathKey: string,
  version: number
): string => {
  return `${getObjectBaseKey(metaId, pathKey)}.${version}`
}
