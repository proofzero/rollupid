import { z } from 'zod'
import { EdgesMetadata } from '@kubelt/platform/edges/src/jsonrpc/validators/edge'
import { AccountURNInput } from '@kubelt/platform-middleware/inputValidators'

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
  accountURN: AccountURNInput,
  timestamp: z.number(),
  name: z.string(),
  imageURL: z.string(),
})

export const GetAuthorizedAccountsMethodOutput = z.object({
  accounts: z.array(AuthorizedUser),
  metadata: EdgesMetadata,
})
