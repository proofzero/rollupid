import { BaseContext, DeploymentMetadata } from '@kubelt/types'
import type { inferAsyncReturnType } from '@trpc/server'
import type { Environment } from '../types'
import createEdgesClient from '@kubelt/platform-clients/edges'
import { AccountURN } from '@kubelt/urns/account'
import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import { ApplicationURN } from '@kubelt/urns/application'
import {
  generateTraceContextHeaders,
  generateTraceSpan,
  TraceSpan,
} from '@kubelt/platform-middleware/trace'

/**
 * Defines your inner context shape.
 * Add fields here that the inner context brings.
 */
interface CreateInnerContextOptions
  extends Partial<FetchCreateContextFnOptions & BaseContext> {
  Analytics: AnalyticsEngineDataset
  ServiceDeploymentMetadata: DeploymentMetadata
  StarbaseApp: DurableObjectNamespace
  Edges: Fetcher
  edges?: ReturnType<typeof createEdgesClient>
  accountURN?: AccountURN
  ownAppURNs?: ApplicationURN[]
  traceSpan?: TraceSpan
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
  const edges = createEdgesClient(opts.Edges, {
    ...generateTraceContextHeaders(traceSpan),
  })
  console.debug('STARBASE TRPC TRACE', traceSpan)
  return {
    ...opts,
    edges,
    traceSpan,
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
    res: opts.resHeaders,
    ...contextInner,
  }
}

// For more docs on this, see https://trpc.io/docs/context
export type Context = inferAsyncReturnType<typeof createContextInner>
