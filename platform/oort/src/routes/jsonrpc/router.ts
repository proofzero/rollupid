import pick from 'lodash/pick'
import { Router } from 'itty-router'
import { status } from 'itty-router-extras'
import { JSONRPCVersionTwoRequest } from 'jayson/promise'

import getServer from './server'

import { RPCContext } from '../../jsonrpc'
import { CoreRequest } from '../core/types'

import { metricSubmit, eventSubmit } from '../../packages/analytics/submit'

const handle = async (request: CoreRequest): Promise<Response> => {
  metricSubmit('oort.jsonrpc.request')

  const { address, core, claims, packages } = request.coreContext
  const traceCore = `core.${core.state.id.toString()}`
  const server = getServer(packages)

  let body: JSONRPCVersionTwoRequest
  try {
    body = await request.json()
  } catch (err) {
    metricSubmit('oort.jsonrpc.request.body_error')
    console.error(err)
    return status(400, server.error())
  }

  const rpc = pick(body, ['id', 'jsonrpc', 'method'])
  const context: RPCContext = { address, core, claims, packages, rpc }

  metricSubmit(`oort.jsonrpc.method.${rpc.method}.call`, [])

  eventSubmit('core request', `request:${rpc.method}`, [], traceCore)

  return new Promise((resolve) => {
    try {
      server.call(body, context, (err, result) => {
        metricSubmit(`oort.jsonrpc.response.${err ? 'error' : 'result'}`)
        metricSubmit(
          `oort.jsonrpc.method.${rpc.method}.${err ? 'error' : 'result'}`
        )
        resolve(status(200, err || result))
      })
    } catch (err) {
      metricSubmit('oort.jsonrpc.response.error')
      metricSubmit(`oort.jsonrpc.method.${rpc.method}.error`)
      console.error(err)
      return status(200, server.error())
    }
  })
}

const router = Router()
router.all('*', (request: Request) => handle(request as CoreRequest))

export default router
