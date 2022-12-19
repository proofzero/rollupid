import { drizzle } from 'drizzle-orm-sqlite/d1'
import { AddressRpcContext } from '../../types'

export default async (
  request: Readonly<Request>,
  context: AddressRpcContext
) => {
  const db = drizzle(context.get('COLLECTIONS'))
  context.collectionDB = db
}
