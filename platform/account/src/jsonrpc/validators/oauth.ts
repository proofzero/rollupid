import { z } from 'zod'

export const OAuthDataSchema = z.object({
  timestamp: z.number().default(() => Date.now()),
  accessToken: z.string(),
  accessTokenSecret: z.string().optional(),
  refreshToken: z.string().optional(),
  extraParams: z
    .object({
      expires_in: z.number().optional(),
      scope: z.union([z.string().optional(), z.array(z.string())]),
      token_type: z.string().optional(),
      id_token: z.string().optional(),
    })
    .optional(),
  profile: z.any(),
})
