import { Methods } from '@open-rpc/meta-schema'

import JSONRPC, { MethodMap } from '../jsonrpc'

type PingResult = 'pong'

export default class Ping extends JSONRPC {
  getMethodMap(): MethodMap {
    return super.getMethodMap({
      kb_ping: 'ping',
      kb_pong: 'pong',
    })
  }

  getMethodObjects(): Methods {
    return super.getMethodObjects([
      {
        name: 'kb_ping',
        params: [],
        result: {
          name: 'pong',
          schema: {
            type: 'string',
          },
        },
      },
      {
        name: 'kb_pong',
        params: [],
        result: {
          name: 'pong',
          schema: {
            type: 'null',
          },
        },
        errors: [
          {
            code: -31999,
            message: 'cannot pong',
          },
        ],
      },
    ])
  }

  async ping(): Promise<PingResult> {
    return 'pong'
  }

  async pong(): Promise<void> {
    this.error(-31999, 'cannot pong')
  }
}
