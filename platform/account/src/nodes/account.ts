import { createDurable } from 'itty-durable'

import type { Profile } from '../jsonrpc/middlewares/profile'
import type { Node } from '@kubelt/types'
import type { Environment } from '../types'

export default class Account extends createDurable({
  autoReturn: true,
  autoPersist: false,
}) {
  declare state: Node.IttyDurableObjectState<Environment>

  async getProfile(): Promise<Profile | null> {
    const stored = await this.state.storage.get<Profile>('profile')
    return stored || null
  }

  async setProfile(profile: Profile): Promise<void> {
    return this.state.storage.put('profile', profile)
  }
}
