import { z } from 'zod'

// Input
// -----------------------------------------------------------------------------

export const GetAuthorizedAccountsMethodInput = z.object({
  client: z.string(),
  opt: z.object({
    offset: z.number(),
    limit: z.number(),
  }),
})

export type GetAuthorizedAccountsParams = z.infer<
  typeof GetAuthorizedAccountsMethodInput
>

// Output
// -----------------------------------------------------------------------------

export const AuthorizedUser = z.object({
  accountURN: z.string().startsWith('urn:rollupid:account/'),
  timestamp: z.number(),
  name: z.string(),
  imageURL: z.string(),
})

export const GetAuthorizedAccountsMethodOutput = z.object({
  users: z.array(AuthorizedUser),
  metadata: z.object({
    offset: z.number().optional(),
    limit: z.number().optional(),
    edgesReturned: z.number(),
  }),
})
