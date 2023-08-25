import { DurableObjectStubProxy } from 'do-proxy'
import type { inferAsyncReturnType } from '@trpc/server'
import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'

import type { BaseContext } from '@proofzero/types'
import type { AccountType, NodeType } from '@proofzero/types/account'
import type { AccountURN } from '@proofzero/urns/account'

import { ENSRes } from '@proofzero/platform-clients/ens-utils'
import createEmailClient from '@proofzero/platform-clients/email'

import {
  generateTraceContextHeaders,
  generateTraceSpan,
} from '@proofzero/platform-middleware/trace'

import {
  Authorization,
  ExchangeCode,
} from '@proofzero/platform.authorization/src'
import type { Identity } from '@proofzero/platform.identity'

import * as db from '@proofzero/platform.edges/src/db'

import type { Environment } from './types'
import type { AccountNode } from '@proofzero/platform.account/src/nodes'

export const GeoContext = 'com.kubelt.geo/location'

export type DeploymentMetadata = {
  name: string
  deployment: {
    id: string
    number: number
    timestamp: string
  }
}

/**
 * Defines your inner context shape.
 * Add fields here that the inner context brings.
 */
export interface CreateInnerContextOptions
  extends Environment,
    Partial<FetchCreateContextFnOptions & BaseContext> {
  authorization?: Authorization
  exchangeCode?: ExchangeCode

  authorizationNode?: DurableObjectStubProxy<Authorization>
  identityNode?: DurableObjectStubProxy<Identity>

  account?: AccountNode
  account3RN?: AccountURN
  accountURN?: AccountURN
  alias?: string
  hashedIdref?: string
  nodeType?: NodeType
  addrType?: AccountType
  accountDescription?: ENSRes

  apiKey?: string
  ownAppURNs?: string[]
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
export async function createContextInner(
  opts: CreateInnerContextOptions &
    Environment & {
      waitUntil?: (promise: Promise<unknown>) => void
    }
) {
  const traceSpan = generateTraceSpan(opts.req?.headers)
  return {
    ...opts,
    traceSpan,
    graph: db.init(opts.EDGES),
    emailClient: createEmailClient(
      opts.Email,
      generateTraceContextHeaders(traceSpan)
    ),
  }
}

/**
 * Outer context. Used in the routers and will e.g. bring `req` & `res` to the context as "not `undefined`".
 *
 * @see https://trpc.io/docs/context#inner-and-outer-context
 */
export async function createContext(
  opts: FetchCreateContextFnOptions & {
    waitUntil?: (promise: Promise<unknown>) => void
  },
  env: Environment
) {
  const { req } = opts
  const contextInner = await createContextInner({ ...opts, ...env })
  return {
    ...contextInner,
    req,
  }
}

// For more docs on this, see https://trpc.io/docs/context
export type Context = inferAsyncReturnType<typeof createContextInner>
