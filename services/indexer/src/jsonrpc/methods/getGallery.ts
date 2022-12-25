import { z } from 'zod'
import { Context } from '../../context'
import { AddressURN } from '@kubelt/urns/address'
import { AddressURNInput } from '../middlewares/inputValidators'

export type GetGalleryParams = AddressURN[] // addresses

export const GetGalleryInput = z.array(AddressURNInput)

export const getGalleryMethod = async ({
  input,
  ctx,
}: {
  input: GetGalleryParams
  ctx: Context
}) => {
  const galleryStmt = await ctx.COLLECTIONS?.prepare(
    `SELECT * FROM tokens WHERE addressURN IN (${input.join(
      ','
    )}) AND gallery_order IS NOT NULL`
  )
  const gallery = await galleryStmt?.all()

  return {
    gallery,
  }
}
