import { z } from 'zod'
import { Node } from '../../../../edges/src/jsonrpc/validators/node'

export const ProfileSchema = z.object({
  displayName: z.string().max(50),
  handle: z.string().optional(),
  pfp: z
    .object({
      image: z.string(),
      isToken: z.boolean().optional(),
    })
    .optional(),
  job: z.string().max(30).optional(),
  location: z.string().max(30).optional(),
})

export const AddressesSchema = z.array(Node)
