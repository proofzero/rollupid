import jsonrpc from '../jsonrpc'
import { Environment } from '../types'

type Message = {
  method: string
  body: any
}
export default async (
  batch: MessageBatch<Message>,
  env: Environment,
  ctx: ExecutionContext
): Promise<void> => {
  console.log({ batch })

  batch.map(async (message: Message) => {
    const req = new Request('', {
      method: message.method,
      body: message.body,
    })

    await jsonrpc(req, env, ctx)
  })
}
