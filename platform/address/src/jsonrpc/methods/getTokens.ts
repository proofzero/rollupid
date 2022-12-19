import * as openrpc from '@kubelt/openrpc'
import type { RpcRequest, RpcService } from '@kubelt/openrpc'

import { AddressRpcContext } from '../../types'
import { tokens } from '../../db/schema'
import { sql } from 'drizzle-orm'

export type GetTokensParams = string[] // addresses

export default async (
  service: Readonly<RpcService>,
  request: Readonly<RpcRequest>,
  context: Readonly<AddressRpcContext>
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
