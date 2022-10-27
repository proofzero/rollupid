import { error } from 'itty-router-extras'
import {
  createRequestHandler,
  JsonRpcRequest,
  JsonRpcResponse,
  RequestHandler,
} from 'typed-json-rpc'

export default class DurableObject<Environment> {
  id: string
  state: DurableObjectState
  env: Environment
  storage: DurableObjectStorage
  api!: RequestHandler

  constructor(state: DurableObjectState, env: Environment) {
    this.id = state.id.toString()
    this.env = env
    this.state = state
    this.storage = state.storage
    this.rpc()
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rpc<Methods extends { [key: string]: any }>(methods?: Methods) {
    if (!methods) {
      throw new Error('missing methods')
    }
    this.api = createRequestHandler<Methods>(methods)
  }

  async fetch(request: Request): Promise<Response> {
    try {
      const jsonRpcRequest: JsonRpcRequest = await request.json()
      const jsonRpcResponse: JsonRpcResponse = await this.api.handleRequest(
        jsonRpcRequest
      )
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
