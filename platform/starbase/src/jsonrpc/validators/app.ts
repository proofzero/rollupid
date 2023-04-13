import { z } from 'zod'

export const AppObjectSchema = z.object({
  name: z.string(),
  scopes: z.set(z.string()).or(z.array(z.string())).optional(), // some reason we can't send Set because it fails as object?
  redirectURI: z.string().optional(),
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
  termsURL: z.string().optional(),
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

export const AppPublicPropsSchema = z.object({
  name: z.string(),
  iconURL: z.string(),
  scopes: z.array(z.string()),
  termsURL: z.string().optional(),
})

export type AppPublicProps = z.infer<typeof AppPublicPropsSchema>
