import { drizzle } from 'drizzle-orm-sqlite/d1'
import type { RpcContext } from '@kubelt/openrpc'
import { AddressRpcContext } from '../../types'

export default async (
  request: Readonly<Request>,
  context: AddressRpcContext
) => {
  const db = drizzle(context.get('COLLECTIONS'))
  context.db = db
}
