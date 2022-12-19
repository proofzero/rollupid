import * as openrpc from '@kubelt/openrpc'
import type { RpcRequest, RpcService } from '@kubelt/openrpc'

import { AddressRpcContext, AddressTokensTable } from '../../types'
import { address_tokens } from '../../db/schema'
import { sql } from 'drizzle-orm'

export type SetGalleryParams = AddressTokensTable[]

export default async (
  service: Readonly<RpcService>,
  request: Readonly<RpcRequest>,
  context: Readonly<AddressRpcContext>
) => {
  const values = request.params as SetGalleryParams
  const db = context.collectionDB
  const upsertGallery = await db
    .insert(address_tokens)
    .values(...values)
    .onConflictDoUpdate({
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
