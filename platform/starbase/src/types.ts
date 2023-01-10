import { z } from 'zod'

export interface Environment {
  StarbaseApp: DurableObjectNamespace
  Edges: Fetcher
}

export const AppObjectSchema = z.object({
  name: z.string(),
  icon: z.string().optional(),
  redirectURI: z.string().optional(),
  termsURL: z.string().optional(),
  websiteURL: z.string().optional(),
  mirrorURL: z.string().optional(),
  discordUser: z.string().optional(),
  mediumUser: z.string().optional(),
  twitterUser: z.string().optional(),
})

export type AppObject = z.infer<typeof AppObjectSchema>

export const AppUpdateableFieldsSchema = z.object({
  clientName: z.string(),
  published: z.boolean().optional(),
  app: AppObjectSchema.optional(),
})

export const AppReadableFieldsSchema = z.object({
  clientId: z.string(),
  secretTimestamp: z.number().optional(),
  apiKeyTimestamp: z.number().optional(),
  scopes: z.array(z.string()).optional(),
})

export const AppInternalFieldSchema = z.object({
  clientSecret: z.string(),
  apiKey: z.string(),
  apiKeySigningKeyPair: z.string(),
})

export const AllFieldsSchema = AppUpdateableFieldsSchema.merge(
  AppReadableFieldsSchema
).merge(AppInternalFieldSchema)

export type AppUpdateableFields = z.infer<typeof AppUpdateableFieldsSchema>
export type AppReadableFields = z.infer<typeof AppReadableFieldsSchema>
export type AppInternalFieldSchema = z.infer<typeof AppInternalFieldSchema>
export type AppAllFields = z.infer<typeof AllFieldsSchema>

export const AppClientIdParamSchema = z.object({
  clientId: z.string(),
})

export type AppClientIdParam = z.infer<typeof AppClientIdParamSchema>
