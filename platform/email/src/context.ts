import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import { BaseContext } from '@proofzero/types'
import type { inferAsyncReturnType } from '@trpc/server'
import type { Environment } from './types'
import { generateTraceSpan } from '@proofzero/platform-middleware/trace'

interface CreateInnerContextOptions
  extends Partial<FetchCreateContextFnOptions & BaseContext & Environment> {}

export async function createContextInner(opts: CreateInnerContextOptions) {
  const traceSpan = generateTraceSpan(opts.req?.headers)

  return { ...opts, traceSpan }
}

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
