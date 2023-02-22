import {
  EdgeTagInput,
  NodeFilterInput,
} from '@kubelt/platform-middleware/inputValidators'
import { z } from 'zod'
import { Node } from './node'

export const EdgeQueryInput = z.object({
  tag: EdgeTagInput.optional(),
  src: NodeFilterInput.optional(),
  dst: NodeFilterInput.optional(),
})

export const EdgeQueryOptionsInput = z
  .object({
    limit: z.number().optional(),
    offset: z.number().optional(),
  })
  .optional()

export const Edge = z.object({
  src: Node,
  dst: Node,
  tag: EdgeTagInput,
  createdTimestamp: z.string().nullable(),
})

export const EdgeQueryResultsOutput = z.object({
  edges: z.array(Edge),
  metadata: z.object({
    edgesReturned: z.number(),
    limit: z.number().optional(),
    offset: z.number().optional(),
  }),
})
