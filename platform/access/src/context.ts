import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import createStarbaseClient from '@proofzero/platform-clients/starbase'
import createAccountClient from '@proofzero/platform-clients/account'
import createEdgesClient from '@proofzero/platform-clients/edges'
import { BaseContext, DeploymentMetadata } from '@proofzero/types'
import type { inferAsyncReturnType } from '@trpc/server'
import { Access, Authorization } from '.'
import type { Environment } from './types'
import type { AccountURN } from '@proofzero/urns/account'
import { DurableObjectStubProxy } from 'do-proxy'
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
  Access: DurableObjectNamespace
  access?: Access
  accessNode?: DurableObjectStubProxy<Access>
  Analytics: AnalyticsEngineDataset
  ServiceDeploymentMetadata: DeploymentMetadata
  Authorization: DurableObjectNamespace
  authorization?: Authorization
  Starbase: Fetcher
  starbaseClient?: ReturnType<typeof createStarbaseClient>
  Edges: Fetcher
  Account: Fetcher
  accountClient?: ReturnType<typeof createAccountClient>
  // Added by InjectEdges middleware.
  edgesClient?: ReturnType<typeof createEdgesClient>
  // Added by ValidateJWT middleware.
  accountURN?: AccountURN
  INTERNAL_JWT_ISS: string
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
  const traceHeader = generateTraceContextHeaders(traceSpan)
  const starbaseClient = createStarbaseClient(opts.Starbase, { ...traceHeader })
  const accountClient = createAccountClient(opts.Account, { ...traceHeader })
  return {
    starbaseClient,
    accountClient,
    traceSpan,
    ...opts,
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
