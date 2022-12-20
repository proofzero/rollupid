import jsonrpc from '../jsonrpc'
import { Environment } from '../types'

type Message = {
  method: string
  body: string
}
export default async (
  batch: MessageBatch<Message>,
  env: Environment,
  ctx: ExecutionContext
): Promise<void> => {
  console.log({ batch })

  batch.messages.map(async (message) => {
    const req = new Request('', {
      method: message.body.method,
      body: message.body.body,
    })

    await jsonrpc(req, env, ctx)
  })
}
