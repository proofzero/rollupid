import { z } from 'zod'

export const CustomDomainLoginProviderConfigSchema = z
  .object({
    clientId: z.string(),
    clientSecret: z.string(),
    redirectUri: z.string(),
  })
  .nullable()
  .default(null)

export type CustomDomainLoginProviderConfigSchema = z.infer<
  typeof CustomDomainLoginProviderConfigSchema
>

export const CustomDomainDNSRecordsSchema = z.array(
  z.object({
    name: z.string(),
    record_type: z.union([z.literal('TXT'), z.literal('CNAME')]),
    expected_value: z.string(),
    value: z.array(z.string()).optional(),
  })
)

export const CustomDomainSchema = z.object({
  id: z.string(),
  hostname: z.string(),
  ownership_verification: z
    .object({
      name: z.string(),
      type: z.string(),
      value: z.string(),
    })
    .optional(),
  ssl: z.object({
    status: z.string(),
    validation_records: z
      .array(
        z.object({
          status: z.string(),
          txt_name: z.string(),
          txt_value: z.string(),
        })
      )
      .optional(),
  }),
  dns_records: CustomDomainDNSRecordsSchema,
  status: z.string(),
  loginProviders: z
    .object({
      apple: CustomDomainLoginProviderConfigSchema,
      discord: CustomDomainLoginProviderConfigSchema,
      github: CustomDomainLoginProviderConfigSchema,
      google: CustomDomainLoginProviderConfigSchema,
      twitter: CustomDomainLoginProviderConfigSchema,
    })
    .partial()
    .optional(),
})

export const CustomDomainLoginProviders = z.union([
  z.literal('apple'),
  z.literal('discord'),
  z.literal('github'),
  z.literal('google'),
  z.literal('twitter'),
])

export type CustomDomainLoginProviders = z.infer<
  typeof CustomDomainLoginProviders
>
