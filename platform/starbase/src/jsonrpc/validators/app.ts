import { z } from 'zod'

export const ScopeMeta = z.object({
  name: z.string(),
  description: z.string(),
  class: z.string(),
})

export const AppObjectSchema = z.object({
  name: z.string(),
  redirectURI: z.string(),
  scopes: z.array(ScopeMeta).default([]),
  icon: z.string().optional(),
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
  createdTimestamp: z.number().optional(),
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

export const AppClientIdParamSchema = z.object({
  clientId: z.string(),
})
