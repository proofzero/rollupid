import { inputValidators } from '@proofzero/platform-middleware'
import { z } from 'zod'

export const AccountListSchema = z.array(inputValidators.AccountURNInput)
