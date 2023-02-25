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
  cover: z.string().optional(),
  bio: z.string().max(256).optional(),
  job: z.string().max(30).optional(),
  location: z.string().max(30).optional(),
  website: z.string().url().or(z.literal('')).optional(),
})

export const LinksSchema = z
  .array(
    z.object({
      name: z.string(),
      url: z.string().url().or(z.literal('')),
    })
  )
  .optional()

export const GallerySchema = z.array(
  z.object({
    contract: z.string(),
    tokenId: z.string(),
    chain: z.string(),
  })
)

export const AddressesSchema = z.array(Node)
