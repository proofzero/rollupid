import { createDurable } from 'itty-durable'

import type { IttyDurableObjectState } from '../types'

export default class Account extends createDurable({
  autoReturn: true,
  autoPersist: false,
}) {
  declare state: IttyDurableObjectState

  async getProfile(): Promise<object | undefined> {
    return this.state.storage.get('profile')
  }

  async setProfile(profile: object): Promise<void> {
    return this.state.storage.put('profile', profile)
  }
}
