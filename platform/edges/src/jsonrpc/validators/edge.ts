import {
  AnyURNInput,
  EdgeDirectionInput,
  EdgeTagInput,
  NodeFilterInput,
} from '@kubelt/platform-middleware/inputValidators'
import { z } from 'zod'
import { Node } from './node'

export const EdgeQueryInput = z.object({
  id: AnyURNInput.optional(),
  tag: EdgeTagInput.optional(),
  dir: EdgeDirectionInput.optional(),
  src: NodeFilterInput.optional(),
  dst: NodeFilterInput.optional(),
})

export const Edge = z.object({
  id: AnyURNInput.optional(),
  src: Node,
  dst: Node,
  tag: EdgeTagInput,
})
