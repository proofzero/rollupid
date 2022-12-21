import * as openrpc from '@kubelt/openrpc'
import type { RpcRequest, RpcService } from '@kubelt/openrpc'

import { IndexRpcContext } from '../../types'
import { tokens } from '../../db/schema'
import { sql } from 'drizzle-orm'
import { AddressURN } from '@kubelt/urns/address'

export type GetTokensParams = AddressURN[] // addresses

export default async (
  service: Readonly<RpcService>,
  request: Readonly<RpcRequest>,
  context: Readonly<IndexRpcContext>
) => {
  const addressUrns = request.params as GetTokensParams
  const db = context.collectionDB
  const gallery = await db
    .select(tokens)
    .where(sql`addressURN IN (${addressUrns})`)
    // TODO: join with collections table to get collection meta
    .all()

  return openrpc.response(request, { gallery })
}
