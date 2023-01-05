import {
  AnyURNInput,
  EdgeDirectionInput,
  EdgeTagInput,
  NodeFilterInput,
} from '@kubelt/platform-middleware/inputValidators'
import { z } from 'zod'

export const EdgeQueryInput = z.object({
  id: AnyURNInput,
  tag: EdgeTagInput.optional(),
  dir: EdgeDirectionInput.optional(),
  src: NodeFilterInput.optional(),
  dst: NodeFilterInput.optional(),
})

export const Node = z.object({
  id: AnyURNInput,
  urn: AnyURNInput,
  nid: z.string(),
  nss: z.string(),
  fragment: z.string(),
  qc: z.record(z.string()),
  rc: z.record(z.string()),
})

export const Edge = z.object({
  id: AnyURNInput.optional(),
  src: Node,
  dst: Node,
  tag: EdgeTagInput,
  perms: z.array(z.string()),
})
