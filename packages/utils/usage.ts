import { BadRequestError } from '@proofzero/errors'

export enum UsageCategory {
  ExternalAppDataRead = 'external-app-data:read',
  ExternalAppDataWrite = 'external-app-data:write',
}

export const generateUsageKey = (
  clientID: string,
  usageCategory: UsageCategory
) => `${clientID}:${usageCategory}`

export const getStoredUsageWithMetadata = async (
  KV: KVNamespace,
  key: string
): Promise<{
  numValue: number
  metadata: {
    limit: number
  }
}> => {
  const { value, metadata } = await KV.getWithMetadata<{
    limit?: number
  }>(key)
  if (!value) {
    throw new BadRequestError({
      message: 'external storage not enabled',
    })
  }
  if (!metadata || !metadata.limit) {
    throw new BadRequestError({
      message: 'missing metadata',
    })
  }

  const numValue = Number(parseInt(value))
  if (isNaN(numValue)) {
    throw new BadRequestError({
      message: 'invalid external storage read count',
    })
  }

  return {
    numValue,
    metadata: {
      limit: metadata.limit,
    },
  }
}
