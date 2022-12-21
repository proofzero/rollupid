import * as openrpc from '@kubelt/openrpc'
import type { RpcRequest, RpcService } from '@kubelt/openrpc'

import { IndexRpcContext } from '../../types'
import { TokensTable, tokens } from '../../db/schema'
import { sql } from 'drizzle-orm'

export type SetTokenParams = TokensTable[]

// This method should get called when change event occurs on chain
// Or when the address is first initialized

export default async (
  service: Readonly<RpcService>,
  request: Readonly<RpcRequest>,
  context: Readonly<IndexRpcContext>
) => {
  const values = request.params as SetTokenParams
  const db = context.collectionDB
  const upsertGallery = await db
    .insert(tokens)
    .values(...values)
    .onConflictDoUpdate({
      where: sql`addressURN != excluded.addressURN`,
      set: {
        gallery_order: null,
        addressURN: sql`excluded.addressURN`,
      },
    })
    .run()

  if (upsertGallery.error) {
    throw `Error upserting gallery: ${upsertGallery.error}`
  }

  return openrpc.response(request, null)
}
