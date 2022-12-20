import { inputValidators } from '@kubelt/platform-middleware'
import { z } from 'zod'

export const AddressList = z.array(inputValidators.AddressURNInput)

export type AddressList = z.infer<typeof AddressList>
