import { z } from 'zod'
import { TokensTable } from '../../db/schema'
import { Context } from '../../context'
import { inputValidators } from '@kubelt/platform-middleware'

export type SetTokensParams = TokensTable[]

export const SetTokensInput = z.array(
  z.object({
    tokenId: z.string(),
    contract: z.string(),
    addressURN: inputValidators.AddressURNInput,
    gallery_order: z.number().optional(),
  })
)

// This method should get called when change event occurs on chain
// Or when the address is first initialized

export const setTokensMethod = async ({
  input,
  ctx,
}: {
  input: SetTokensParams
  ctx: Context
}) => {
  const upsertGallery = await ctx.COLLECTIONS?.prepare(
    `INSERT INTO tokens (tokenId, contract, addressURN, gallery_order) VALUES ${input} 
      ON CONFLICT (tokenId, contract)
      DO UPDATE SET addressURN = excluded.addressURN, gallery_order = null`
  ).all()

  // const db = context.collectionDB
  // const upsertGallery = await db
  //   .insert(tokens)
  //   .values(...values)
  //   .onConflictDoUpdate({
  //     where: sql`addressURN = excluded.addressURN`,
  //     set: {
  //       gallery_order: null,
  //     },
  //   })
  //   .run()

  console.log({ upsertGallery })

  return null
}
