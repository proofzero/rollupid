import { z } from 'zod'
import { GoogleRawProfileSchema } from './profile'

export const GetGoogleOAuthDataSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  extraParams: z.object({
    expires_in: z.number(),
    scope: z.string(),
    token_type: z.string(),
    id_token: z.string(),
  }),
  profile: z.object({
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
  }),
})
