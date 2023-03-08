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

export const GalleryItemSchema = z.object({
  url: z.string().url().optional().nullable(),
  thumbnailUrl: z.string().url().optional().nullable(),
  error: z.boolean(),
  title: z.string().optional().nullable(),
  contract: z.object({ address: z.string() }),
  tokenId: z.string(),
  chain: z.object({ chain: z.string(), network: z.string() }),
  collectionTitle: z.string().optional().nullable(),
  properties: z
    .array(
      z
        .object({ display: z.string(), name: z.string(), value: z.string() })
        .nullable()
    )
    .optional()
    .nullable(),
  details: z.array(
    z.object({
      name: z.string(),
      value: z.string().nullable().optional(),
      isCopyable: z.boolean(),
    })
  ),
})

export const GallerySchema = z.array(
  GalleryItemSchema.or(
    // TEMPORARY MIGRATIONS' "OR"
    z.object({
      chain: z.string(),
      tokenId: z.string(),
      contract: z.string(),
    })
  )
)

export const AddressesSchema = z.array(Node)
