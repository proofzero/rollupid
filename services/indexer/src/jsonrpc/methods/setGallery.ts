import { z } from 'zod'

import { Context } from '../../context'
import { TokensTable, tokens } from '../../db/schema'
import { AddressURNInput } from '../middlewares/inputValidators'

export type SetGalleryParams = TokensTable[]

export const SetGalleryInput = z.array(z.object({
  tokenId: z.string(),
  contract: z.string(),
  addressURN: AddressURNInput,
  gallery_order: z.number().optional(),
}))

export const setGalleryMethod = async ({
  input,
  ctx,
}: {
  input: SetGalleryParams
  ctx: Context
}) => {
  const upsertGallery = await ctx.COLLECTIONS?.prepare(
    `INSERT INTO tokens (tokenId, contract, addressURN, gallery_order) VALUES ${input} 
      ON CONFLICT (tokenId, contract)
      DO UPDATE SET addressURN = excluded.addressURN, gallery_order = excluded.gallery_order`
  ).all()

  // const db = context.collectionDB
  // const upsertGallery = await db
  //   .insert(tokens)
  //   .values(...values)
  //   .onConflictDoUpdate({
  //     where: sql`addressURN = excluded.addressURN`,
  //     set: {
  //       gallery_order: sql`excluded.gallery_order`,
  //     },
  //   })
  //   .run()

  console.log({ upsertGallery })

  return null
}

