import { Methods } from '@open-rpc/meta-schema'

import JSONRPC from '../../jsonrpc'

import { metricSubmit } from './submit'
import { submitMetrics as schemaMethod } from './methods'

import { SubmitParams, SubmitResult } from './types'

export default class Metrics extends JSONRPC {
  getMethodMap() {
    return super.getMethodMap({
      kb_submitMetrics: 'submit',
    })
  }

  getMethodObjects(): Methods {
    return super.getMethodObjects([schemaMethod])
  }

  async submit(params: SubmitParams): Promise<SubmitResult> {
    await metricSubmit(...params)
    return
  }
}
