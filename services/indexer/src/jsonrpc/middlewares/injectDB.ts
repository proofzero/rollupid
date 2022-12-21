import { drizzle } from 'drizzle-orm-sqlite/d1'
import { IndexRpcContext } from '../../types'

export default async (request: Readonly<Request>, context: IndexRpcContext) => {
  const db = drizzle(context.get('COLLECTIONS'))
  context.collectionDB = db
}
