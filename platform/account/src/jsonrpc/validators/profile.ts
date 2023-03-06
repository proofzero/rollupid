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

// export const GallerySchema = z.custom<GalleryInput[]>((input) => {
//   input.forEach((nft) => {
//     if (!nft.chain) throw new Error('Missing chain in gallery instance')
//     if (!nft.details) throw new Error('Missing details in gallery instance')
//     if (!nft.tokenId) throw new Error('Missing tokenId in gallery instance')
//     if (!nft.contract)
//       throw new Error('Missing contract address in gallery instance')
//   })

//   return input as GalleryInput[]
// })
//z.array(

export const GallerySchema = z.array(
  z.object({
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
        z.object({ display: z.string(), name: z.string(), value: z.string() })
      )
      .optional()
      .nullable(),
    details: z.array(
      z.object({
        name: z.string(),
        value: z.string(),
        isCopyable: z.boolean(),
      })
    ),
  })
)

export const AddressesSchema = z.array(Node)
