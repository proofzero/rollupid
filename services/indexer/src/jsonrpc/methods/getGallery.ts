import { z } from 'zod'
import { Context } from '../../context'

import * as openrpc from '@kubelt/openrpc'
import type { RpcRequest, RpcService } from '@kubelt/openrpc'

import { IndexRpcContext } from '../../types'
import { tokens } from '../../db/schema'
import { sql } from 'drizzle-orm'
import { AddressURN, AddressURNSpace } from '@kubelt/urns/address'

export type GetGalleryParams = AddressURN[] // addresses

export const GetGalleryInput = z.custom<AddressURN[]>((input) => {
  if (Array.isArray(input) === false) {
    throw new Error('Invalid Input. Expected list of AddressURNs')
  }
  for (const addressUrn of input as AddressURN[]) {
    if (AddressURNSpace.parse(addressUrn) === null) {
      throw new Error('Invalid AddressURN entry')
    }
  }
})

export const getGalleryMethod = async ({
  input,
  ctx,
}: {
  input: AddressURN[]
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

export default async (
  service: Readonly<RpcService>,
  request: Readonly<RpcRequest>,
  context: Readonly<IndexRpcContext>
) => {
  const addressUrns = request.params as GetGalleryParams
  const db = context.collectionDB
  const gallery = await db
    .select(tokens)
    .where(sql`addressURN IN (${addressUrns}) AND gallery_order IS NOT NULL`)
    // TODO: join with collections table to get collection meta
    .all()

  return openrpc.response(request, { gallery })
}
