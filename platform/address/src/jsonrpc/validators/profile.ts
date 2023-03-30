import { z } from 'zod'

export const CryptoAddressProfileSchema = z.object({
  address: z.string(),
  avatar: z.string().optional(),
  displayName: z.string().optional(),
  isCrypto: z.boolean().default(true),
})

export const GoogleRawProfileSchema = z.object({
  sub: z.string(),
  name: z.string(),
  given_name: z.string(),
  family_name: z.string(),
  picture: z.string(),
  locale: z.string(),
  email: z.string(),
  email_verified: z.boolean(),
  isGoogle: z.boolean().default(true),
})

//Going for a subset of the full profile as there are a lot of (unneeded) fields there
export const GithubRawProfileSubsetSchema = z.object({
  login: z.string(),
  name: z.string().nullable(),
  url: z.string(),
  html_url: z.string(),
  avatar_url: z.string(),
  isGithub: z.boolean().default(true),
})

export const TwitterProfileSchema = z.object({
  id: z.number(),
  name: z.string(),
  screen_name: z.string(),
  profile_image_url_https: z.string(),
  isTwitter: z.boolean().default(true),
})

export const MicrosoftRawProfileSchema = z.object({
  sub: z.string(),
  name: z.string().optional(),
  given_name: z.string().optional(),
  family_name: z.string().optional(),
  email: z.string().optional(),
  picture: z.string(),
  isMicrosoft: z.boolean().default(true),
  rollupidImageUrl: z.string().optional(),
})

export const AppleProfileSchema = z.object({
  email: z.string(),
  name: z.string().optional(),
  picture: z.string(),
  sub: z.string(),
  isApple: z.boolean().default(true),
})

export const DiscordRawProfileSchema = z.object({
  id: z.string(),
  username: z.string(),
  discriminator: z.string(),
  email: z.string(),
  avatar: z.string().optional(),
  isDiscord: z.boolean().default(true),
})

export const EmailProfileSchema = z.object({
  address: z.string(),
  picture: z.string().optional(),
  name: z.string().optional(),
  email: z.string(),
  isEmail: z.boolean().default(true),
})

export const AddressProfileSchema = z.union([
  CryptoAddressProfileSchema,
  GoogleRawProfileSchema,
  GithubRawProfileSubsetSchema,
  TwitterProfileSchema,
  MicrosoftRawProfileSchema,
  AppleProfileSchema,
  DiscordRawProfileSchema,
  EmailProfileSchema,
])
