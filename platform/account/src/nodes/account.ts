import { createDurable } from 'itty-durable'

import type { IttyDurableObjectState } from '../types'
import type { Profile } from '../jsonrpc/middlewares/profile'

export default class Account extends createDurable({
  autoReturn: true,
  autoPersist: false,
}) {
  declare state: IttyDurableObjectState

  async getProfile(): Promise<Profile | null> {
    const stored = await this.state.storage.get<Profile>('profile')
    return stored || null
  }

  async setProfile(profile: Profile): Promise<void> {
    return this.state.storage.put('profile', profile)
  }
}
