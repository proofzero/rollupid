import { z } from 'zod'
import { Context } from '../../context'
import { AddressURN } from '@kubelt/urns/address'
import { inputValidators } from '@kubelt/platform-middleware'

export type GetGalleryParams = AddressURN[] // addresses

export const GetGalleryInput = z.array(inputValidators.AddressURNInput)

export const GetGalleryOutput = z.object({
  gallery: z.array(
    z.object({
      tokenId: z.string(),
      contract: z.string(),
      gallery_order: z.number(),
      addressURN: inputValidators.AddressURNInput,
    })
  ),
})

type GetGalleryOutput = z.infer<typeof GetGalleryOutput>

export const getGalleryMethod = async ({
  input,
  ctx,
}: {
  input: GetGalleryParams
  ctx: Context
}): Promise<GetGalleryOutput> => {
  const galleryStmt = await ctx.COLLECTIONS?.prepare(
    `SELECT * FROM tokens WHERE addressURN IN (${input
      .map((addr) => `'${addr}'`)
      .join(',')}) AND gallery_order IS NOT NULL`
  )
  const galleryRes = await galleryStmt?.all()
  const gallery = {
    gallery: galleryRes?.results?.length ? galleryRes.results : [],
  } as GetGalleryOutput

  return gallery
}
