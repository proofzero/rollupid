import { inputValidators } from '@kubelt/platform-middleware'
import { z } from 'zod'

export const ProfileSchema = z.object({
  displayName: z.string().max(50),
  pfp: z
    .object({
      image: z.string(),
      isToken: z.boolean().optional().nullable(),
    })
    .optional()
    .nullable(),
  cover: z.string().optional().nullable(),
  defaultAddress: inputValidators.AddressURNInput,
  bio: z.string().max(256).optional().nullable(),
  job: z.string().max(30).optional().nullable(),
  location: z.string().max(30).optional().nullable(),
  website: z.string().url().or(z.literal('')).optional().nullable(),
  links: z
    .array(
      z.object({
        name: z.string(),
        url: z.string().url().or(z.literal('')),
        verified: z.boolean(),
        links_order: z.number(),
      })
    )
    .optional()
    .nullable(),
})
