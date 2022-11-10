import _ from 'lodash'
import { Server, Utils } from 'jayson'
import { MethodLike } from 'jayson/promise'

import { Methods } from '@open-rpc/meta-schema'

import Core from './core'
import Package from './package'

import { Context } from './types'

interface RPC {
  id?: string | number
  jsonrpc: string
  method: string
}

export interface RPCContext extends Context {
  rpc: RPC
}

export type MethodMap = { [methodName: string]: MethodLike }

export default class JSONRPC extends Package {
  constructor(core: Core) {
    super(core)
  }

  getMethodMap(initial = {}): MethodMap {
    const map = {}
    Object.entries(initial).forEach(
      ([methodName, propName]: [string, string]) => {
        map[methodName] = async (...args) => {
          try {
            const result = await this[propName](...args)
            return result
          } catch (err) {
            if (Utils.Response.isValidError(err)) {
              throw err
            } else {
              console.error(err)
              this.error(err.code, err.message, err.data)
            }
          }
        }
      }
    )
    return map
  }

  getMethodObjects(initial: Methods = []): Methods {
    return initial
  }

  async authenticate(context: Context): Promise<void> {
    const error = () => this.error(null, 'cannot authenticate')
    !context.claims && error()
    const { aud: audience, iss: issuer, sub: subject } = context.claims
    if (audience.includes(issuer) && issuer === subject) return
    if (await this.core.isOwner(subject)) return
    error()
  }

  async authorize(context: Context, ...asked: string[]): Promise<void> {
    await this.authenticate(context)
    if (asked.length == 0) return
    const { sub: subject } = context.claims
    const granted = await this.core.getClaims(subject)
    const matched = _.intersection(asked, granted)
    if (asked.length && matched.length == asked.length) return
    this.error(null, 'cannot authorize')
  }

  invalidRequest(message = 'invalid request', data?: object) {
    this.error(Server.errors.INVALID_REQUEST, message, data)
  }

  error(code?: number | null, message?: string, data?: object) {
    // TODO: we should set proper codes for all errors
    code ||= Server.errors.INTERNAL_ERROR
    message ||= Server.errorMessages[code]
    throw {
      code,
      message,
      data,
    }
  }
}
