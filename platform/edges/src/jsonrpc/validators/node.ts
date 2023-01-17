import { AnyURNInput } from '@kubelt/platform-middleware/inputValidators'
import { z } from 'zod'

export const Node = z.object({
  id: AnyURNInput,
  urn: AnyURNInput,
  nid: z.string(),
  nss: z.string(),
  fragment: z.string(),
  qc: z.record(z.string()).or(z.boolean()),
  rc: z.record(z.string()).or(z.boolean()),
})
