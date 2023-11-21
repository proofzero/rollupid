type UsageType = 'read' | 'write'
type UsageFeature = 'external-storage'

export const generateUsageKey = (
  clientID: string,
  feature: UsageFeature,
  type: UsageType
) => `${clientID}:${feature}:${type}`
