import { z } from 'zod'
import { Context } from '../../context'
import { AddressURN } from '@kubelt/urns/address'
import { inputValidators } from '@kubelt/platform-middleware'

export type GetGalleryParams = AddressURN[] // addresses

export const GetGalleryInput = z.array(inputValidators.AddressURNInput)

export const getGalleryMethod = async ({
  input,
  ctx,
}: {
  input: GetGalleryParams
  ctx: Context
}) => {
  console.log({ input, ctx })
  const galleryStmt = await ctx.COLLECTIONS?.prepare(
    `SELECT * FROM tokens WHERE addressURN IN (${input
      .map((addr) => `'${addr}'`)
      .join(',')}) AND gallery_order IS NOT NULL`
  )
  const gallery = await galleryStmt?.all()
  console.log({ gallery })
  return {
    gallery: gallery?.results,
  }
}
