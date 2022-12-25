import { z } from 'zod'
import { Context } from '../../context'
import { AddressURN } from '@kubelt/urns/address'
import { AddressURNInput } from '../middlewares/inputValidators'

export type GetTokensParams = AddressURN[] // addresses

export const GetTokensInput = z.array(AddressURNInput)

export const getTokensMethod = async ({
  input,
  ctx,
}: {
  input: GetTokensParams
  ctx: Context
}) => {
  const galleryStmt = await ctx.COLLECTIONS?.prepare(
    `SELECT * FROM tokens WHERE addressURN IN (${input.join(
      ','
    )})`
  )
  const gallery = await galleryStmt?.all()

  return {
    gallery,
  }
}
