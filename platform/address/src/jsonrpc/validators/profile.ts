import { z } from 'zod'

export const CryptoAddressProfileSchema = z.object({
  address: z.string(),
  avatar: z.string().optional(),
  displayName: z.string().optional(),
  nftarVoucher: z.any().optional(),
})

export const GoogleRawProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  given_name: z.string(),
  family_name: z.string(),
  picture: z.string(),
  locale: z.string(),
  email: z.string(),
  email_verified: z.boolean(),
})

export const AddressProfileSchema = z.union([
  CryptoAddressProfileSchema,
  GoogleRawProfileSchema,
])
