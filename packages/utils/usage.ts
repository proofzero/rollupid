export enum UsageCategory {
  ExternalAppDataRead = 'external-app-data:read',
  ExternalAppDataWrite = 'external-app-data:write',
}

export const generateUsageKey = (
  clientID: string,
  usageCategory: UsageCategory
) => `${clientID}:${usageCategory}`
