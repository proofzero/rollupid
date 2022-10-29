import _ from 'lodash'
import {
  JSONRPCError,
  JSONRPCResponse,
  JSONRPCVersionTwoRequest,
} from 'jayson/promise'

import Core from '../core'
import JSONRPC, { RPCContext } from '../jsonrpc'

type RelayConstructorOptions = {
  url: string
  authorization: string
}

const constructorOptionKeys = ['url', 'authorization']

export default class Relay extends JSONRPC {
  url: string
  authorization: string

  constructor(core: Core, options: Partial<RelayConstructorOptions> = {}) {
    super(core)
    _.defaults(this, _.pick(options, ...constructorOptionKeys))
  }

  fetch(options: JSONRPCVersionTwoRequest) {
    const method = 'POST'
    const headers = {
      accept: 'application/json',
      'content-type': 'application/json; charset=utf-8',
    }
    if (this.authorization) {
      headers['authorization'] = this.authorization
    }
    return fetch(this.url, {
      method,
      headers,
      body: JSON.stringify({
        ...options,
      }),
    })
  }

  async call(
    method: string,
    params: object | unknown[],
    context: RPCContext,
    generateRequestId?: () => number | string
  ) {
    if (!context.rpc) {
      context.rpc = { id: 1, jsonrpc: '2.0', method }
    }
    let id = context.rpc.id
    let body: JSONRPCResponse
    const { jsonrpc } = context.rpc

    if (generateRequestId) {
      id = generateRequestId()
    }

    try {
      const response = await this.fetch({ jsonrpc, id, method, params })
      body = await response.json()
    } catch (err) {
      console.error(err)
      return this.error(null, err)
    }

    if ('error' in body) {
      const { code, message, data } = body.error as JSONRPCError
      return this.error(code, (data && data['message']) || message)
    } else if ('result' in body) {
      return body.result
    }
  }
}
