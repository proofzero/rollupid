import { inputValidators } from '@proofzero/platform-middleware'
import { z } from 'zod'

export const AddressListSchema = z.array(inputValidators.AddressURNInput)
