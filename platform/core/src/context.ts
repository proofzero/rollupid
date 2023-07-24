import { DurableObjectStubProxy } from 'do-proxy'
import type { inferAsyncReturnType } from '@trpc/server'
import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'

import type { BaseContext } from '@proofzero/types'
import type { AddressType, NodeType } from '@proofzero/types/address'
import type { AddressURN } from '@proofzero/urns/address'

import { ENSRes } from '@proofzero/platform-clients/ens-utils'
import createEmailClient from '@proofzero/platform-clients/email'

import {
  generateTraceContextHeaders,
  generateTraceSpan,
} from '@proofzero/platform-middleware/trace'

import { Access, Authorization } from '@proofzero/platform.access/src'
import type { Account } from '@proofzero/platform.account'

import * as db from '@proofzero/platform.edges/src/db'

import type { Environment } from './types'
import type { AddressNode } from '@proofzero/platform.address/src/nodes'

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
  access?: Access
  authorization?: Authorization

  accessNode?: DurableObjectStubProxy<Access>
  accountNode?: DurableObjectStubProxy<Account>

  address?: AddressNode
  address3RN?: AddressURN
  addressURN?: AddressURN
  alias?: string
  hashedIdref?: string
  nodeType?: NodeType
  addrType?: AddressType
  addressDescription?: ENSRes

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
  opts: CreateInnerContextOptions & Environment
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
  opts: FetchCreateContextFnOptions,
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
