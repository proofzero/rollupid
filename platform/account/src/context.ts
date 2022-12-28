import type { inferAsyncReturnType } from '@trpc/server'
import type { CreateNextContextOptions } from '@trpc/server/adapters/next'
import { proxyDurable } from 'itty-durable'

import { jwt } from '@kubelt/platform-middleware'
import { Environment, Account } from '.'

/**
 * Defines your inner context shape.
 * Add fields here that the inner context brings.
 */
interface CreateInnerContextOptions extends Partial<CreateNextContextOptions> {
  Account: DurableObjectNamespace
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
  // TODO: should this all be middleware steps?
  const headers = opts.req?.headers
  const token = headers?.get(jwt.AccountJWTHeader)

  if (!token) throw new Error('No JWT found in headers')

  // TODO: validate token

  const { accountURN } = jwt.AccountJWTFromHeader(token)

  if (!accountURN) throw new Error('No accountURN found in JWT')

  const proxy = await proxyDurable(opts.Account, {
    name: 'account',
    class: Account,
    parse: true,
  })

  const node = proxy.get(accountURN) as Account

  return {
    token,
    accountURN,
    node,
    ...opts,
  }
}
/**
 * Outer context. Used in the routers and will e.g. bring `req` & `res` to the context as "not `undefined`".
 *
 * @see https://trpc.io/docs/context#inner-and-outer-context
 */
export async function createContext(
  opts: CreateNextContextOptions,
  env: Environment
) {
  const contextInner = await createContextInner({ ...opts, ...env })
  return {
    req: opts.req,
    res: opts.res,
    ...contextInner,
  }
}

// For more docs on this, see https://trpc.io/docs/context
export type Context = inferAsyncReturnType<typeof createContextInner>
