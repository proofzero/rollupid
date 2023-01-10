import { inputValidators } from '@kubelt/platform-middleware'
import { z } from 'zod'

export const AddressListSchema = z.array(inputValidators.AddressURNInput)
