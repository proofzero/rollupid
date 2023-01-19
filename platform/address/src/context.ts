import { BaseContext } from '@kubelt/types'
import type { inferAsyncReturnType } from '@trpc/server'
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import type { Environment } from './types'
import type { AddressType, NodeType } from '@kubelt/types/address'
import createEdgesClient from '@kubelt/platform-clients/edges'
import { AddressURN } from '@kubelt/urns/address'
import { ENSRes } from '@kubelt/platform-clients/ens-utils'
import { AddressNode } from './nodes'

/**
 * Defines your inner context shape.
 * Add fields here that the inner context brings.
 */
interface CreateInnerContextOptions
  extends Partial<FetchCreateContextFnOptions & BaseContext> {
  TOKEN_NFTAR: string
  NFTAR_CHAIN_ID: string
  NFTAR_URL: string
  Address: DurableObjectNamespace
  Analytics: AnalyticsEngineDataset
  HANDLES: KVNamespace
  Edges: Fetcher
  Access: Fetcher
  Image: Fetcher
  address?: AddressNode
  address3RN?: AddressURN
  addressURN?: AddressURN
  alias?: string
  hashedIdref?: string
  nodeType?: NodeType
  addrType?: AddressType
  addressDescription?: ENSRes
}
/**
 * Inner context. Will always be available in your procedures, in contrast to the outer context.
 *
 * Also useful for:
 * - testing, so you don't have to mock Next.js' `req`/`res`
 * - tRPC's `createSSGHelpers` where we don't have `req`/`res`
 *
 * @see https://trpc.io/docs/context#inner-and-outer-context
 */
export async function createContextInner(opts: CreateInnerContextOptions) {
  const edges = createEdgesClient(opts.Edges)
  return {
    ...opts,
    edges,
  }
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
