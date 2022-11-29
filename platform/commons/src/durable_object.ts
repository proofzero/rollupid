import { error } from 'itty-router-extras'
import {
  createRequestHandler,
  JsonRpcRequest,
  JsonRpcResponse,
} from 'typed-json-rpc'

import { HEADER_CORE_ADDRESS, HEADER_ACCESS_TOKEN } from './constants'

/**
 * The context of a JSON-RPC request contains data from the environment related
 * to the individual request.
 */
export interface Context {
  address?: string
  token?: string
}

/**
 * DurableObject class is the base implementation for JSON-RPC API.
 *
 * `fetch` method passes incoming requests to JSON-RPC request handler. The
 * method handler functions are got from `methods` method.
 *
 * `methods` method should be overriden by the sub-class implementations. The
 * method map returned by this method is given to JSON-RPC request handler. The
 * methods should be bound to a proxy of the durable object instance to access
 * context object.
 *
 * `context` property is designed to be provided through proxy object only and
 * should be instantiated per request.
 */
export default class DurableObject<
  Environment,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Api extends { [key: string]: any }
> {
  id: string
  state: DurableObjectState
  env: Environment
  storage: DurableObjectStorage
  context?: Context
  coreType: string | undefined
  coreName: string | undefined

  constructor(state: DurableObjectState, env: Environment) {
    this.id = state.id.toString()
    this.env = env
    this.state = state
    this.storage = state.storage

    // TODO: what else should we bootstrap into memory?
    // `blockConcurrencyWhile()` ensures no requests are delivered until
    // initialization completes.
    this.state.blockConcurrencyWhile(async () => {
      const coreType = (await this.storage.get('core-type')) as string
      this.coreType = coreType || undefined

      const coreName = (await this.storage.get('core-name')) as string
      this.coreName = coreName || undefined
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  methods(proxy: object): Api {
    throw new Error('not implemented')
  }

  getType(): string | undefined {
    return this.coreType
  }

  setType(type: string): Promise<void> {
    this.coreType = type
    return this.storage.put('core-type', type)
  }

  getName(): string | undefined {
    return this.coreName
  }

  setName(name: string): Promise<void> {
    this.coreName = name
    return this.storage.put('core-name', name)
  }

  // get(key: string): Promise<unknown> {
  //   return this.storage.get(key)
  // }

  async fetch(request: Request): Promise<Response> {
    const context: Context = {}
    context.address = request.headers.get(HEADER_CORE_ADDRESS) || ''
    context.token = request.headers.get(HEADER_ACCESS_TOKEN) || ''

    const proxy = new Proxy(this, {
      get(target: object, prop: string, receiver: object) {
        if (prop == 'context') {
          return context
        }
        return Reflect.get(target, prop, receiver)
      },
    })

    const methods = this.methods(proxy)
    const requestHandler = createRequestHandler<Api>(methods)
    try {
      const jsonRpcRequest: JsonRpcRequest = await request.json()
      const jsonRpcResponse: JsonRpcResponse =
        await requestHandler.handleRequest(jsonRpcRequest)
      return new Response(JSON.stringify(jsonRpcResponse), {
        headers: {
          'Content-Type': 'application/json',
        },
      })
    } catch (err) {
      return error(500, JSON.stringify(err))
    }
  }
}
