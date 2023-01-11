import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'

import { appRouter } from '../jsonrpc/router'
import { createContext } from '../context'
import { Environment } from '..'

type Message = {
  method: string
  body: string
}
export default async (
  batch: MessageBatch<Message>,
  ctx: ExecutionContext,
  env: Environment
): Promise<void> => {
  console.log({ batch })

  batch.messages.map(async (message) => {
    const req = new Request('', {
      method: message.body.method,
      body: message.body.body,
    })

    await fetchRequestHandler({
      endpoint: '/trpc',
      req,
      router: appRouter,
      onError({ error, type, path, input, ctx, req }) {
        console.error('Error:', error)
      },
      createContext: (opts) =>
        createContext(opts as FetchCreateContextFnOptions, env),
    })
  })
}
