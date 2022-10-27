import { DurableObject } from '@kubelt/worker-commons'

import { Environment, CoreApi } from './types'
import { check } from './utils'

export default class Core extends DurableObject<Environment> {
  rpc() {
    super.rpc<CoreApi>({
      kb_setAddress: this.set.bind(this),
      kb_unsetAddress: this.unset.bind(this),
      kb_resolveAddress: this.resolve.bind(this),
    })
  }

  async set(address: string, type: string, coreId: string): Promise<void> {
    check(address, type)
    await this.storage.put({ address, type, coreId })
  }

  async unset(): Promise<void> {
    await this.storage.deleteAll()
  }

  async resolve(): Promise<string | null> {
    const coreId = await this.storage.get<string>('coreId')
    if (!coreId) {
      return null
    }
    return coreId
  }
}
