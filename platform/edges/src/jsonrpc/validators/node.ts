import { AnyURNInput } from '@proofzero/platform-middleware/inputValidators'
import { z } from 'zod'

export const Node = z.object({
  baseUrn: AnyURNInput,
  qc: z.record(z.string()),
  rc: z.record(z.string()),
})
