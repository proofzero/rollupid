import * as openrpc from '@kubelt/openrpc'
import type { RpcRequest, RpcService } from '@kubelt/openrpc'

import { AddressRpcContext } from '../../types'
import { TokensTable, tokens } from '../../db/schema'
import { sql } from 'drizzle-orm'

export type SetGalleryParams = TokensTable[]

export default async (
  service: Readonly<RpcService>,
  request: Readonly<RpcRequest>,
  context: Readonly<AddressRpcContext>
) => {
  const values = request.params as SetGalleryParams
  const db = context.collectionDB
  const upsertGallery = await db
    .insert(tokens)
    .values(...values)
    .onConflictDoUpdate({
      where: sql`addressURN = excluded.addressURN`,
      set: {
        gallery_order: sql`excluded.gallery_order`,
      },
    })
    .run()

  if (upsertGallery.error) {
    throw `Error upserting gallery: ${upsertGallery.error}`
  }

  return openrpc.response(request, null)
}
