import { z } from 'zod'

import { inputValidators } from '@kubelt/platform-middleware'
import { Context } from '../../context'
import { TokensTable } from '../../db/schema'

export type SetGalleryParams = TokensTable[]

export const SetGalleryInput = z.array(
  z.object({
    tokenId: z.string(),
    contract: z.string(),
    addressURN: inputValidators.AddressURNInput,
    gallery_order: z.number().optional(),
  })
)

export const setGalleryMethod = async ({
  input,
  ctx,
}: {
  input: SetGalleryParams
  ctx: Context
}) => {
  console.log({ input, ctx })

  const upsertSQL = `INSERT INTO tokens (tokenId, contract, addressURN, gallery_order) VALUES ${input
    .map(
      (val) =>
        `('${val.tokenId}', '${val.contract}', '${val.addressURN}', '${val.gallery_order}')`
    )
    .join(',')}
    ON CONFLICT (tokenId, contract)
    DO UPDATE SET addressURN = excluded.addressURN, gallery_order = excluded.gallery_order`

  const upsertGalleryStmt = await ctx.COLLECTIONS?.prepare(upsertSQL)

  const upsertGallery = await upsertGalleryStmt?.all()

  console.log({ upsertGallery })

  return null
}
