import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '../jsonrpc/router'
import { createContext } from '../context'

type Message = {
  method: string
  body: string
}
export default async (
  batch: MessageBatch<Message>,
  ctx: ExecutionContext
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
      createContext,
    })
  })
}
