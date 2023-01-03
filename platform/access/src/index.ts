import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import type { CreateNextContextOptions } from '@trpc/server/adapters/next'
import { createContext } from './context'
import { appRouter } from './jsonrpc/router'
import type { Environment } from './types'
import Access from './nodes/access'
import Authorization from './nodes/authorization'

export default {
  async fetch(request: Request, env: Environment): Promise<Response> {
    return fetchRequestHandler({
      endpoint: '/trpc',
      req: request,
      router: appRouter,
      onError({ error, type, path, input, ctx, req }) {
        console.error('Error:', error)
        // TODO: report somehwere
      },
      createContext: (opts) =>
        createContext(opts as CreateNextContextOptions, env),
    })
  },
}
export { Access, Authorization }
