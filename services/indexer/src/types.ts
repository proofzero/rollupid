import { RpcContext } from '@kubelt/openrpc'
import { AccessApi } from '@kubelt/platform-clients/access'
import { DrizzleD1Database } from 'drizzle-orm-sqlite/d1'

export interface Environment {
  Access: Fetcher
  Edges: Fetcher

  COLLECTIONS: D1Database

  APIKEY_MORALIS: string
  MORALIS_STREAM_ID: string
  URL_MORALIS_WEBHOOK: string

  BLOCKCHAIN_ACTIVITY: Queue
}

export interface IndexRpcContext extends RpcContext {
  collectionDB: DrizzleD1Database
  Edges: Fetcher
  Access: AccessApi
  URL_MORALIS_WEBHOOK: string
  APIKEY_MORALIS: string
  MORALIS_STREAM_ID: string
  BLOCKCHAIN_ACTIVITY: Queue
}
