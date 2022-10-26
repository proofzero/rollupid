/*
   Core Durable Object module

   The module is designated to be a durable object providing an HTTP
   interface to be used by Fetch API.
*/

import _ from 'lodash'
import { Request } from 'itty-router'
import { status } from 'itty-router-extras'

import { Server } from 'jayson/promise'

import DurableObject from './durable_object'

import { jsonrpc } from './routes'
import coreContext from './routes/core/context'

import { Claims } from './types'

export const addressKeys = ['eth', 'ens']

export interface AddressMap {
  eth: string[]
  ens: string[]
}

export type GetAddressTypes = [keyof AddressMap] | []

export type AddressDescription = { type: string; address: string }
export type SetAddressRequestBody = AddressDescription
export type UnsetAddressRequestBody = AddressDescription

export default class Core extends DurableObject {
  server: Server

  registerRoutes() {
    this.router
      .all('/*', coreContext(this).handle)
      .post('/address', this.setAddress.bind(this))
      .delete('/address', this.unsetAddress.bind(this))
      .post('/jsonrpc', jsonrpc.router.handle)
  }

  async getAddresses(types: GetAddressTypes): Promise<Partial<AddressMap>> {
    const map: Partial<AddressMap> = await this.storage.get('core/addressMap')
    if (types?.length) {
      return _.pick(map, types)
    } else {
      return map
    }
  }

  async setAddress(request: Request): Promise<Response> {
    const { type, address }: SetAddressRequestBody = await request.json()
    const map: Partial<AddressMap> =
      (await this.storage.get('core/addressMap')) || {}
    map[type] = _.union(map[type] || [], [address])
    await this.storage.put('core/addressMap', map)
    return status(200)
  }

  async unsetAddress(request: Request): Promise<Response> {
    const { type, address }: UnsetAddressRequestBody = await request.json()
    const map: Partial<AddressMap> =
      (await this.storage.get('core/addressMap')) || {}
    _.pull(map[type] || [], address)
    await this.storage.put('core/addressMap', map)
    return status(200)
  }

  async isOwner(subject: string): Promise<boolean> {
    const addressMap: AddressMap = await this.storage.get('core/addressMap')
    const addressLists = Object.values(addressMap)
    const results = addressLists.map((l) => l.indexOf(subject) > -1)
    return results.indexOf(true) > -1
  }

  async getClaims(subject: string): Promise<Claims> {
    if (!subject) {
      return []
    }
    const local: Claims = await this.storage.get(`${subject}/claims`)
    const preset: Claims = await this.env.CORE_CLAIMS.get(subject, 'json')
    return _.union(local || [], preset || [])
  }

  async grantClaims(subject: string, claims: Claims): Promise<void> {
    const current: Claims = await this.storage.get(`${subject}/claims`)
    const next = _.union(current || [], claims)
    await this.storage.put<Claims>(`${subject}/claims`, next)
  }
}
