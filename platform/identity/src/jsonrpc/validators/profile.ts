import { z } from 'zod'
import { AccountURNInput } from '@proofzero/platform-middleware/inputValidators'
import { Node } from '../../../../edges/src/jsonrpc/validators/node'

export const ProfileSchema = z.object({
  displayName: z.string().max(50),
  pfp: z
    .object({
      image: z.string(),
      isToken: z.boolean().optional(),
    })
    .optional(),
  primaryAccountURN: AccountURNInput.optional(),
  customized: z.boolean().optional(),
})

export const AccountSchema = Node.extend({
  baseUrn: AccountURNInput,
})
export const AccountsSchema = z.array(AccountSchema)
