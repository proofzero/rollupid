import { z } from 'zod'

const NFTarTraitsSchema = z.object({
  type: z.string(),
  value: z.object({
    rnd: z.array(z.number()),
    name: z.string(),
    rgb: z.object({
      r: z.number(),
      g: z.number(),
      b: z.number(),
    }),
  }),
})

export const NFTarVoucherSchema = z.object({
  voucher: z.object({
    recipient: z.string(),
    uri: z.string(),
    signature: z.string(),
  }),
  signature: z.object({
    message: z.string(),
    messageHash: z.string(),
    v: z.string(),
    r: z.string(),
    s: z.string(),
    signature: z.string(),
  }),
  metadata: z.object({
    name: z.string(),
    description: z.string(),
    image: z.string(),
    external_url: z.string(),
    properties: z.object({
      metadata: z.object({
        name: z.string(),
        chainId: z.number().or(z.string()),
        account: z.string(),
      }),
      traits: z.object({
        trait0: NFTarTraitsSchema,
        trait1: NFTarTraitsSchema,
        trait2: NFTarTraitsSchema,
        trait3: NFTarTraitsSchema,
      }),
      GEN: z.string(),
      Priority: z.string(),
      Friend: z.string(),
      Points: z.string(),
    }),
  }),
})

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
  name: z
    .object({
      firstName: z.string(),
      lastName: z.string(),
    })
    .optional(),
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

export const AddressProfileSchema = z.union([
  CryptoAddressProfileSchema,
  GoogleRawProfileSchema,
  GithubRawProfileSubsetSchema,
  TwitterProfileSchema,
  MicrosoftRawProfileSchema,
  AppleProfileSchema,
  DiscordRawProfileSchema,
])
