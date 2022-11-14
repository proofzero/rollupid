import { DurableObject } from '@kubelt/worker-commons'

import { Api, Environment, PingResult, PongResult } from './types'

export default class Core extends DurableObject<Environment, Api> {
  methods(proxy: object) {
    return {
      kb_ping: this.ping.bind(proxy),
      kb_pong: this.pong.bind(proxy),
    }
  }

  ping(): PingResult {
    return 'pong'
  }

  pong(): PongResult {
    throw 'cannot pong'
  }
}
