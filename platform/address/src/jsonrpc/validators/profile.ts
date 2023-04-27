import { z } from 'zod'

import {
  CryptoAddressType,
  EmailAddressType,
  OAuthAddressType,
} from '@proofzero/types/address'

export const AddressProfileSchema = z.object({
  address: z.string(),
  title: z.string(),
  icon: z.string().optional(),
  disconnected: z.boolean().optional(),
  type: z.union([
    z.literal(CryptoAddressType.ETH),
    z.literal(CryptoAddressType.Wallet),
    z.literal(EmailAddressType.Email),
    z.literal(OAuthAddressType.Apple),
    z.literal(OAuthAddressType.Discord),
    z.literal(OAuthAddressType.GitHub),
    z.literal(OAuthAddressType.Google),
    z.literal(OAuthAddressType.Microsoft),
    z.literal(OAuthAddressType.Twitter),
  ]),
})
