import { BaseContext } from '@kubelt/types'
import type { inferAsyncReturnType } from '@trpc/server'
import type { Environment } from './types'
import * as db from './db'
import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import { DrizzleD1Database } from 'drizzle-orm-sqlite/d1'

/**
 * Defines your inner context shape.
 * Add fields here that the inner context brings.
 */
interface CreateInnerContextOptions
  extends Partial<FetchCreateContextFnOptions & BaseContext> {
  EDGES: D1Database
}
type InnerContext = CreateInnerContextOptions & { db: DrizzleD1Database }
/**
 * Inner context. Will always be available in your procedures, in contrast to the outer context.
 *
 * Also useful for:
 * - testing, so you don't have to mock Next.js' `req`/`res`
 * - tRPC's `createSSGHelpers` where we don't have `req`/`res`
 *
 * @see https://trpc.io/docs/context#inner-and-outer-context
 */
export async function createContextInner(
  opts: CreateInnerContextOptions
): Promise<InnerContext> {
  const drizzleD1Database = db.init(opts.EDGES)
  return { ...opts, db: drizzleD1Database }
}
/**
 * Outer context. Used in the routers and will e.g. bring `req` & `res` to the context as "not `undefined`".
 *
 * @see https://trpc.io/docs/context#inner-and-outer-context
 */
export async function createContext(
  opts: FetchCreateContextFnOptions,
  env: Environment
) {
  const contextInner = await createContextInner({ ...opts, ...env })
  return {
    req: opts.req,
    resHeaders: opts.resHeaders,
    ...contextInner,
  }
}

// For more docs on this, see https://trpc.io/docs/context
export type Context = inferAsyncReturnType<typeof createContextInner>
