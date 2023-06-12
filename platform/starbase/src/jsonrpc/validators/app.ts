import { z } from 'zod'
import { CustomDomainSchema } from './customdomain'

export const AppObjectSchema = z.object({
  name: z.string(),
  scopes: z.set(z.string()).or(z.array(z.string())).optional(), // some reason we can't send Set because it fails as object?
  redirectURI: z.string().optional(),
  icon: z.string().optional(),
  termsURL: z.string().optional(),
  privacyURL: z.string().optional(),
  websiteURL: z.string().optional(),
  customDomain: CustomDomainSchema.optional(),
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
  privacyURL: z.string().optional(),
  customDomain: CustomDomainSchema.optional(),
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

export const AppThemeSchema = z.object({
  heading: z.string().optional(),
  signMessageTemplate: z.string().optional(),
  radius: z.string().optional(),
  color: z
    .object({
      light: z.string().regex(/^#[0-9a-fA-F]{6}$/),
      dark: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    })
    .optional(),
  graphicURL: z.string().url().optional(),
  providers: z
    .array(
      z.object({
        key: z.string(),
        enabled: z.boolean(),
      })
    )
    .optional(),
})

export type AppTheme = z.infer<typeof AppThemeSchema>

export const EmailOTPThemeSchema = z.object({
  logoURL: z.string().url().optional(),
  address: z.string().optional(),
  contact: z.string().url().optional(),
})

export type EmailOTPTheme = z.infer<typeof EmailOTPThemeSchema>

export const AppPublicPropsSchema = z.object({
  name: z.string(),
  iconURL: z.string(),
  scopes: z.array(z.string()).optional(),
  redirectURI: z.string().optional(),
  termsURL: z.string().optional(),
  privacyURL: z.string().optional(),
  websiteURL: z.string().optional(),
  appTheme: AppThemeSchema.optional(),
  customDomain: z
    .object({
      hostname: z.string(),
      isActive: z.boolean(),
    })
    .optional(),
})

export type AppPublicProps = z.infer<typeof AppPublicPropsSchema>

export const PaymasterProviderSchema = z.literal('zerodev')

export const PaymasterSchema = z
  .object({
    provider: PaymasterProviderSchema,
    secret: z.string(),
  })
  .optional()

export type PaymasterType = z.infer<typeof PaymasterSchema>

export type PaymasterProviderType = z.infer<typeof PaymasterProviderSchema>
