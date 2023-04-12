import { BaseContext, DeploymentMetadata } from '@proofzero/types'
import type { inferAsyncReturnType } from '@trpc/server'
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import type { Environment } from './types'
import type { AddressType, NodeType } from '@proofzero/types/address'
import createEdgesClient from '@proofzero/platform-clients/edges'
import createEmailClient from '@proofzero/platform-clients/email'
import { AddressURN } from '@proofzero/urns/address'
import { ENSRes } from '@proofzero/platform-clients/ens-utils'
import { AddressNode } from './nodes'
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
  Address: DurableObjectNamespace
  Analytics: AnalyticsEngineDataset
  ServiceDeploymentMetadata: DeploymentMetadata
  HANDLES: KVNamespace
  Edges: Fetcher
  Email: Fetcher
  Access: Fetcher
  Images: Fetcher
  address?: AddressNode
  address3RN?: AddressURN
  addressURN?: AddressURN
  alias?: string
  hashedIdref?: string
  nodeType?: NodeType
  addrType?: AddressType
  addressDescription?: ENSRes

  PASSPORT_URL: string

  INTERNAL_APPLE_OAUTH_CLIENT_ID: string
  SECRET_APPLE_OAUTH_CLIENT_SECRET: string

  INTERNAL_DISCORD_OAUTH_CLIENT_ID: string
  SECRET_DISCORD_OAUTH_CLIENT_SECRET: string

  INTERNAL_GITHUB_OAUTH_CLIENT_ID: string
  SECRET_GITHUB_OAUTH_CLIENT_SECRET: string

  INTERNAL_GOOGLE_OAUTH_CLIENT_ID: string
  SECRET_GOOGLE_OAUTH_CLIENT_SECRET: string

  INTERNAL_MICROSOFT_OAUTH_CLIENT_ID: string
  SECRET_MICROSOFT_OAUTH_CLIENT_SECRET: string

  INTERNAL_TWITTER_OAUTH_CLIENT_ID: string
  SECRET_TWITTER_OAUTH_CLIENT_SECRET: string
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
  const emailClient = createEmailClient(
    opts.Email,
    generateTraceContextHeaders(traceSpan)
  )
  return {
    ...opts,
    traceSpan,
    edges,
    emailClient,
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
