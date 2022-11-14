import { DurableObject } from '@kubelt/platform.commons'

import { Environment, CoreApi } from './types'
import { getType } from './utils'

export default class Core extends DurableObject<Environment, CoreApi> {
  methods(): CoreApi {
    return {
      kb_setAddress: this.setAddress.bind(this),
      kb_setName: this.setName.bind(this),
      kb_deleteAddress: this.delete.bind(this),
      kb_resolveAddress: this.resolve.bind(this),
    }
  }

  async setAddress(address: string, coreId: string): Promise<void> {
    const type = getType(address)
    await this.storage.put({ address, type, coreId })
  }

  async setName(address: string, eth: string, coreId: string): Promise<void> {
    await this.storage.put({ address, eth, coreId })
  }

  async delete(): Promise<void> {
    await this.storage.deleteAll()
  }

  async resolve(address: string): Promise<string> {
    let coreId = await this.storage.get<string>('coreId')
    if (coreId) {
      return coreId
    }

    const type = getType(address)
    if (type != 'eth') {
      throw 'cannot resolve'
    }

    coreId = this.env.Core.newUniqueId().toString()
    await this.setAddress(address, coreId)
    return coreId
  }
}
