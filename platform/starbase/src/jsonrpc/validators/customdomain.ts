import { z } from 'zod'

export const CustomDomainDNSRecordsSchema = z.array(
  z.object({
    name: z.string(),
    record_type: z.union([z.literal('TXT'), z.literal('CNAME')]),
    expected_value: z.string(),
    required: z.boolean().default(true).optional(),
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
})
