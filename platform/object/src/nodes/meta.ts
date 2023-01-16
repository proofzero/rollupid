import { DOProxy } from 'do-proxy'

import { Visibility } from '../types'

export default class MetaObject extends DOProxy {
  declare state: DurableObjectState

  async get(): Promise<{
    version: number
    visibility: Visibility
  }> {
    return {
      version: (await this.state.storage.get('version')) || 0,
      visibility:
        (await this.state.storage.get('visibility')) || Visibility.PUBLIC,
    }
  }

  async set(
    version: number,
    visibility: Visibility
  ): Promise<{
    version: number
    visibility: Visibility
  }> {
    await Promise.all([
      await this.state.storage.put('version', version),
      await this.state.storage.put('visibility', visibility),
    ])

    return {
      version,
      visibility,
    }
  }
}
