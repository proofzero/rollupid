import { Methods } from '@open-rpc/meta-schema'

import JSONRPC from '../../jsonrpc'

import { eventSubmit } from './submit'
import { submitEvent as schemaMethod } from './methods'

import { EventParams, EventResult } from './types'

export default class Metrics extends JSONRPC {
  getMethodMap() {
    return super.getMethodMap({
      kb_submitEvent: 'submit',
    })
  }

  getMethodObjects(): Methods {
    return super.getMethodObjects([schemaMethod])
  }

  async submit(params: EventParams): Promise<EventResult> {
    await eventSubmit(
      params.title,
      params.text,
      params.tags,
      params.aggregationKey
    )
    return
  }
}
