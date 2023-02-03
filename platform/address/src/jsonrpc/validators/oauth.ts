import { OAuthAddressType } from '@kubelt/types/address'
import { z } from 'zod'
import { GoogleRawProfileSchema, MicrosoftRawProfileSchema } from './profile'

export const GoogleOAuthSchema = z.object({
  provider: z.literal(OAuthAddressType.Google),
  id: z.string(),
  displayName: z.string(),
  name: z.object({
    familyName: z.string(),
    givenName: z.string(),
  }),
  emails: z.array(
    z.object({
      value: z.string(),
    })
  ),
  photos: z.array(
    z.object({
      value: z.string(),
    })
  ),
  _json: GoogleRawProfileSchema,
  isGoogle: z.boolean().default(true),
})

export const MicrosoftOAuthSchema = z.object({
  provider: z.literal(OAuthAddressType.Microsoft),
  id: z.string(),
  displayName: z.string(),
  _json: MicrosoftRawProfileSchema,
  name: z
    .object({
      familyName: z.string().nullable(),
      givenName: z.string().nullable(),
    })
    .nullable(),
  emails: z.array(z.object({ value: z.string().nullable() })),
  isMicrosoft: z.boolean().default(true),
})

export const GithubOAuthSchema = z.object({
  provider: z.literal(OAuthAddressType.GitHub),
  id: z.string(),
  displayName: z.string(),
  name: z
    .object({
      familyName: z.string().nullable(),
      givenName: z.string().nullable(),
      middleName: z.string().nullable(),
    })
    .nullable(),
  emails: z.array(z.object({ value: z.string().nullable() })),
  photos: z.array(z.object({ value: z.string().nullable() })),
  _json: z.object({
    login: z.string(),
    id: z.number(),
    node_id: z.string(),
    avatar_url: z.string(),
    gravatar_id: z.string(),
    url: z.string(),
    html_url: z.string(),
    followers_url: z.string(),
    following_url: z.string(),
    gists_url: z.string(),
    starred_url: z.string(),
    subscriptions_url: z.string(),
    organizations_url: z.string(),
    repos_url: z.string(),
    events_url: z.string(),
    received_events_url: z.string(),
    type: z.string(),
    site_admin: z.boolean(),
    name: z.string().nullable(),
    company: z.string().nullable(),
    blog: z.string(),
    location: z.string().nullable(),
    email: z.string().nullable(),
    hireable: z.boolean().nullable(),
    bio: z.string().nullable(),
    twitter_username: z.string().nullable(),
    public_repos: z.number(),
    public_gists: z.number(),
    followers: z.number(),
    following: z.number(),
    created_at: z.string(),
    updated_at: z.string(),
    isGithub: z.boolean().default(true),
  }),
})

export const TwitterOAuthSchema = z.object({
  provider: z.literal(OAuthAddressType.Twitter),
  id: z.number(),
  name: z.string(),
  screen_name: z.string(),
  profile_image_url_https: z.string(),
  _json: z.undefined(),
  isTwitter: z.boolean().default(true),
})

export const AppleOAuthSchema = z.object({
  provider: z.literal(OAuthAddressType.Apple),
  email: z.string(),
  name: z
    .object({
      firstName: z.string(),
      lastName: z.string(),
    })
    .optional(),
  picture: z.string(),
  sub: z.string(),
  _json: z.undefined(),
  isApple: z.boolean().default(true),
})

export const OAuthDataSchema = z.object({
  timestamp: z.number().default(() => Date.now()),
  accessToken: z.string(),
  accessTokenSecret: z.string().optional(),
  refreshToken: z.string().optional(),
  extraParams: z
    .object({
      expires_in: z.number().optional(),
      scope: z.string().optional(),
      token_type: z.string().optional(),
      id_token: z.string().optional(),
    })
    .optional(),
  profile: z.discriminatedUnion('provider', [
    GoogleOAuthSchema,
    GithubOAuthSchema,
    TwitterOAuthSchema,
    MicrosoftOAuthSchema,
    AppleOAuthSchema,
  ]),
})
