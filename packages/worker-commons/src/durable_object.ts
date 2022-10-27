import { error } from 'itty-router-extras'
import {
  createRequestHandler,
  JsonRpcRequest,
  JsonRpcResponse,
} from 'typed-json-rpc'

export default class DurableObject<
  Environment,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Methods extends { [key: string]: any }
> {
  id: string
  state: DurableObjectState
  env: Environment
  storage: DurableObjectStorage

  constructor(state: DurableObjectState, env: Environment) {
    this.id = state.id.toString()
    this.env = env
    this.state = state
    this.storage = state.storage
  }

  methods(): Methods {
    throw new Error('not implemented')
  }

  async fetch(request: Request): Promise<Response> {
    const requestHandler = createRequestHandler<Methods>(this.methods())
    try {
      const jsonRpcRequest: JsonRpcRequest = await request.json()
      const jsonRpcResponse: JsonRpcResponse =
        await requestHandler.handleRequest(jsonRpcRequest)
      if ('error' in jsonRpcResponse) {
        console.error(jsonRpcResponse.error)
      }
      return new Response(JSON.stringify(jsonRpcResponse), {
        headers: {
          'Content-Type': 'application/json',
        },
      })
    } catch (err) {
      console.error(err)
      return error(500, JSON.stringify(err))
    }
  }
}
