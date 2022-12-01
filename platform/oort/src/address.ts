import { Request } from 'itty-router'
import { error, status } from 'itty-router-extras'

import { isAddress } from '@ethersproject/address'

import DurableObject from './durable_object'

export interface AddressDescription {
  type: string
  address: string
  coreId: string
}

export interface NameDescription extends AddressDescription {
  type: 'ens'
  name: string
}

export type SetRequestBody = AddressDescription
export type UnsetRequestBody = AddressDescription

export default class Address extends DurableObject {
  registerRoutes() {
    this.router
      .get('/:type/:address', this.getCoreId.bind(this))
      .post('/', this.set.bind(this))
      .delete('/', this.unset.bind(this))
  }

  async set(request: Request): Promise<Response> {
    const body: SetRequestBody = await request.json()
    const { type, address, coreId } = body

    if (type == 'eth') {
      if (!isAddress(address)) {
        return error(400, 'bad eth address')
      }
    } else if (type == 'ens') {
      const { name } = body as NameDescription
      if (!name.endsWith('.eth')) {
        return error(400, 'bad ens name')
      }
    } else {
      return error(400, `oort: unsupported address type for ${address}`)
    }

    if (type == 'eth') {
      await this.bindCoreToAddress(body)
    } else if (type == 'ens') {
      const { name, address } = body as NameDescription
      await this.storage.put('eth', address)
      await this.storage.put('lastCheck', Date.now())
      await this.bindCoreToAddress({ type, address: name, coreId })
    }

    await this.storage.put('coreId', coreId)
    return status(200)
  }

  async unset(request: Request): Promise<Response> {
    const body: UnsetRequestBody = await request.json()
    const type: string = await this.storage.get('type')
    const address: string = await this.storage.get('address')

    if (type == 'ens') {
      const address: string = await this.storage.get('eth')
      if (body.address != address) {
        return status(400, 'address do not match')
      }
    }

    const { Core } = this.env
    const coreId: string = await this.storage.get<string>('coreId')
    const core = Core.get(Core.idFromString(coreId))

    await core.fetch('http://localhost/address', {
      method: 'DELETE',
      body: JSON.stringify({ type, address }),
    })
    await this.storage.delete('coreId')

    return status(200)
  }

  async bindCoreToAddress(description: AddressDescription): Promise<void> {
    const { Core } = this.env
    const { type, address, coreId } = description
    const core = Core.get(Core.idFromString(coreId))
    const method = 'POST'
    const body = JSON.stringify({ type, address })
    await core.fetch(`http://localhost/address`, { method, body })
    await this.storage.put('type', type)
    await this.storage.put('address', address)
  }

  async getCoreId(request: Request): Promise<Response> {
    const coreId: string = await this.storage.get('coreId')
    if (coreId) {
      const { type, address } = request.params
      await this.bindCoreToAddress({ type, address, coreId })
      return status(200, { coreId })
    } else {
      return error(404, 'not found')
    }
  }
}
