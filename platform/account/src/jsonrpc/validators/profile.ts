import { z } from 'zod'

import {
  CryptoAccountType,
  EmailAccountType,
  OAuthAccountType,
  WebauthnAccountType,
} from '@proofzero/types/account'

export const AccountProfileSchema = z.object({
  id: z.string(),
  address: z.string(),
  title: z.string(),
  icon: z.string().optional(),
  disconnected: z.boolean().optional(),
  type: z.union([
    z.literal(CryptoAccountType.ETH),
    z.literal(CryptoAccountType.Wallet),
    z.literal(EmailAccountType.Mask),
    z.literal(EmailAccountType.Email),
    z.literal(WebauthnAccountType.WebAuthN),
    z.literal(OAuthAccountType.Apple),
    z.literal(OAuthAccountType.Discord),
    z.literal(OAuthAccountType.GitHub),
    z.literal(OAuthAccountType.Google),
    z.literal(OAuthAccountType.Microsoft),
    z.literal(OAuthAccountType.Twitter),
  ]),
})

export const MaskAccountProfileSchema = AccountProfileSchema.extend({
  source: AccountProfileSchema,
})
