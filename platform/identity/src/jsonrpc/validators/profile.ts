import { z } from 'zod'
import { inputValidators } from '@proofzero/platform-middleware'
import { Node } from '../../../../edges/src/jsonrpc/validators/node'

export const ProfileSchema = z.object({
  displayName: z.string().max(50),
  pfp: z
    .object({
      image: z.string(),
      isToken: z.boolean().optional(),
    })
    .optional(),
  primaryAccountURN: inputValidators.AccountURNInput.optional(),
  consoleOnboardingData: z
    .object({
      isComplete: z.boolean().optional(),
      orgType: z.enum(['solo', 'team']).optional(),
    })
    .optional(),
})

export const AccountsSchema = z.array(Node)
