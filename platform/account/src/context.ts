import createEdgesClient from '@proofzero/platform-clients/edges'
import type { Environment } from './types'
import type { inferAsyncReturnType } from '@trpc/server'
import { Account } from '.'
import { BaseContext, DeploymentMetadata } from '@proofzero/types'
import { DurableObjectStubProxy } from 'do-proxy'
import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import {
  generateTraceContextHeaders,
  generateTraceSpan,
} from '@proofzero/platform-middleware/trace'

/**
 * Defines your inner context shape.
 * Add fields here that the inner context brings.
 */
interface CreateInnerContextOptions
  extends Partial<FetchCreateContextFnOptions & BaseContext> {
  Account: DurableObjectNamespace
  Edges: Fetcher
  Analytics: AnalyticsEngineDataset
  ServiceDeploymentMetadata: DeploymentMetadata
  account?: DurableObjectStubProxy<Account>
  JWKS_INTERNAL_URL_BASE: string

  // accountURN?: AccountURN
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
  const traceSpan = generateTraceSpan(opts.req?.headers)

  const edges = createEdgesClient(
    opts.Edges,
    generateTraceContextHeaders(traceSpan)
  )
  return {
    ...opts,
    traceSpan,
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
